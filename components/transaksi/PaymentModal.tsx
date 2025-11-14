'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  transaksiId: string;
  total: number;
  onSuccess: () => void;
}

type PaymentMethod = 'tunai' | 'transfer' | 'e_wallet' | 'qris' | null;
type PaymentType = 'tunai' | 'non_tunai' | null;

export function PaymentModal({
  open,
  onClose,
  transaksiId,
  total,
  onSuccess,
}: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cashPaid, setCashPaid] = useState<string>('');

  // Calculate change
  const cashPaidNum = parseFloat(cashPaid.replace(/[^\d]/g, '')) || 0;
  const change = cashPaidNum - total;
  const isChangeValid = change >= 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Format file tidak valid. Gunakan JPG, PNG, WEBP, atau PDF');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      setProofFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setProofPreview(null);
      }
    }
  };

  const removeFile = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const uploadProof = async (): Promise<string | null> => {
    if (!proofFile) return null;

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${transaksiId}-${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, proofFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Gagal mengupload bukti pembayaran: ' + error.message);
        return null;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Unexpected error uploading file:', err);
      toast.error('Terjadi kesalahan saat mengupload file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCashDenomination = (amount: number) => {
    const current = parseFloat(cashPaid.replace(/[^\d]/g, '')) || 0;
    const newAmount = current + amount;
    setCashPaid(newAmount.toLocaleString('id-ID'));
  };

  const formatCurrency = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    // Format with thousand separators
    return parseInt(numbers, 10).toLocaleString('id-ID');
  };

  const handleCashPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setCashPaid(formatted);
  };

  const handleSubmit = async () => {
    if (!paymentType) {
      toast.error('Pilih jenis pembayaran terlebih dahulu');
      return;
    }

    if (paymentType === 'tunai') {
      if (!cashPaid || cashPaidNum === 0) {
        toast.error('Masukkan jumlah uang yang dibayar');
        return;
      }
      if (cashPaidNum < total) {
        toast.error('Uang yang dibayar kurang dari total pembayaran');
        return;
      }
    }

    if (paymentType === 'non_tunai' && !paymentMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      setProcessing(true);

      // Upload proof if exists
      let proofUrl: string | null = null;
      if (proofFile) {
        proofUrl = await uploadProof();
        if (!proofUrl && paymentType === 'non_tunai') {
          // For non-tunai, proof is recommended but not required
          toast.warning('Bukti pembayaran gagal diupload, tetapi pembayaran tetap diproses');
        }
      }

      // Determine final payment method
      const finalMethod: PaymentMethod = paymentType === 'tunai' ? 'tunai' : paymentMethod!;

      // Get kode_struk from transaction
      const { data: transaksiData } = await supabase
        .from('transaksi')
        .select('kode_struk')
        .eq('id', transaksiId)
        .single();

      if (!transaksiData) {
        toast.error('Transaksi tidak ditemukan');
        return;
      }

      // Update all transactions with the same kode_struk
      const updateData: {
        status_pembayaran: string;
        metode_pembayaran: PaymentMethod;
        bukti_pembayaran_url?: string | null;
      } = {
        status_pembayaran: 'lunas',
        metode_pembayaran: finalMethod,
      };

      if (proofUrl) {
        updateData.bukti_pembayaran_url = proofUrl;
      }

      const { error } = await supabase
        .from('transaksi')
        .update(updateData)
        .eq('kode_struk', transaksiData.kode_struk)
        .eq('status_pembayaran', 'belum_lunas');

      if (error) {
        console.error('Error updating payment:', error);
        toast.error('Gagal memperbarui pembayaran: ' + error.message);
        return;
      }

      toast.success('Pembayaran berhasil diproses!');
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('Unexpected error processing payment:', err);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing && !uploading) {
      setPaymentType(null);
      setPaymentMethod(null);
      setProofFile(null);
      setProofPreview(null);
      setCashPaid('');
      onClose();
    }
  };

  // Color scheme for denomination buttons
  const getDenominationColor = (amount: number) => {
    if (amount >= 50000) return 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800';
    if (amount >= 20000) return 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800';
    if (amount >= 10000) return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
    if (amount >= 5000) return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800';
    if (amount >= 2000) return 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800';
    return 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Sistem Pembayaran</DialogTitle>
          <DialogDescription className="text-sm">
            Pilih metode pembayaran untuk transaksi ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Total Amount */}
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-5 sm:p-6 shadow-lg">
            <Label className="text-sm sm:text-base text-white/90 font-medium">Total Pembayaran</Label>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Rp {total.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Payment Type Selection */}
          <div className="space-y-3">
            <Label className="text-base sm:text-lg font-semibold">Jenis Pembayaran *</Label>
            <RadioGroup
              value={paymentType || ''}
              onValueChange={(value) => {
                setPaymentType(value as PaymentType);
                if (value === 'tunai') {
                  setPaymentMethod('tunai');
                  setCashPaid(''); // Reset cash paid when switching to cash
                } else {
                  setPaymentMethod(null);
                  setCashPaid(''); // Reset cash paid when switching away from cash
                }
              }}
            >
              <div className="flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer min-h-[56px]">
                <RadioGroupItem value="tunai" id="tunai" className="h-5 w-5" />
                <Label htmlFor="tunai" className="flex-1 cursor-pointer font-medium text-base sm:text-lg">
                  Tunai
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 sm:p-5 border-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition cursor-pointer min-h-[56px]">
                <RadioGroupItem value="non_tunai" id="non_tunai" className="h-5 w-5" />
                <Label htmlFor="non_tunai" className="flex-1 cursor-pointer font-medium text-base sm:text-lg">
                  Non Tunai
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Cash Payment Section */}
          {paymentType === 'tunai' && (
            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-3">
                <Label className="text-base sm:text-lg font-semibold">Uang yang Dibayar *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-lg sm:text-xl z-10">
                    Rp
                  </span>
                  <Input
                    type="text"
                    value={cashPaid}
                    onChange={handleCashPaidChange}
                    placeholder="0"
                    className="pl-14 pr-4 text-xl sm:text-2xl font-bold h-14 sm:h-16 border-2 focus:border-blue-500"
                    disabled={processing || uploading}
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Masukkan jumlah uang yang diterima dari pelanggan
                </p>
              </div>

              {/* Denomination Buttons */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base font-semibold text-gray-700">
                  Klik Pecahan Uang
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[1000, 2000, 5000, 10000, 20000, 50000, 100000].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      onClick={() => handleCashDenomination(amount)}
                      className={`h-14 sm:h-16 text-sm sm:text-base font-bold border-2 transition-all active:scale-95 ${getDenominationColor(amount)}`}
                      disabled={processing || uploading}
                    >
                      {amount >= 1000 ? `${(amount / 1000).toLocaleString('id-ID')}rb` : amount.toLocaleString('id-ID')}
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCashPaid('')}
                  className="w-full h-12 text-sm font-semibold border-red-300 text-red-700 hover:bg-red-50"
                  disabled={processing || uploading || !cashPaid}
                >
                  Reset
                </Button>
              </div>

              {/* Change Display */}
              <div
                className={`rounded-xl p-5 sm:p-6 border-2 shadow-md ${
                  isChangeValid
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : cashPaidNum > 0
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base sm:text-lg font-bold text-gray-700">
                    Kembalian
                  </Label>
                  <p
                    className={`text-2xl sm:text-3xl font-bold ${
                      isChangeValid ? 'text-green-700' : cashPaidNum > 0 ? 'text-red-700' : 'text-gray-500'
                    }`}
                  >
                    {isChangeValid
                      ? `Rp ${change.toLocaleString('id-ID')}`
                      : cashPaidNum > 0
                        ? `Kurang Rp ${Math.abs(change).toLocaleString('id-ID')}`
                        : 'Rp 0'}
                  </p>
                </div>
                {!isChangeValid && cashPaidNum > 0 && (
                  <p className="text-xs sm:text-sm text-red-600 font-medium">
                    Uang yang dibayar kurang dari total pembayaran
                  </p>
                )}
                {isChangeValid && (
                  <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                    Pembayaran sudah cukup
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Selection (for non-tunai) */}
          {paymentType === 'non_tunai' && (
            <div className="space-y-3">
              <Label className="text-base sm:text-lg font-semibold">Metode Pembayaran *</Label>
              <Select
                value={paymentMethod || ''}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger className="h-12 sm:h-14 text-base">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer" className="text-base py-3">Transfer Bank</SelectItem>
                  <SelectItem value="e_wallet" className="text-base py-3">E-Wallet</SelectItem>
                  <SelectItem value="qris" className="text-base py-3">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Proof of Payment Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Bukti Pembayaran {paymentType === 'non_tunai' && '(Opsional)'}
            </Label>
            {!proofFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-upload"
                  disabled={processing || uploading}
                />
                <Label
                  htmlFor="proof-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Klik untuk upload bukti pembayaran
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG, WEBP, atau PDF (maks. 5MB)
                  </span>
                </Label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 space-y-3">
                {proofPreview ? (
                  <div className="relative">
                    <img
                      src={proofPreview}
                      alt="Preview bukti pembayaran"
                      className="w-full h-48 object-contain rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      disabled={processing || uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{proofFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={processing || uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold border-2"
              disabled={processing || uploading}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className={`flex-1 h-12 sm:h-14 text-base sm:text-lg font-bold shadow-lg ${
                paymentType === 'tunai' && !isChangeValid
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
              }`}
              disabled={processing || uploading || (paymentType === 'tunai' && !isChangeValid)}
            >
              {processing || uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {uploading ? 'Mengupload...' : 'Memproses...'}
                </>
              ) : (
                'Proses Pembayaran'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

