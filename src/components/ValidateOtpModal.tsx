import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { userApi, GenerateOtpData, ValidateOtpData, ValidateOtpResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface ValidateOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'generate' | 'validate' | 'result';

export function ValidateOtpModal({ isOpen, onClose }: ValidateOtpModalProps) {
  const [step, setStep] = useState<Step>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [generateData, setGenerateData] = useState<GenerateOtpData>({
    user_type: 'admin',
    user_phone: '',
    user_role: 'admin',
  });
  const [validateData, setValidateData] = useState<ValidateOtpData>({
    user_phone: '',
    user_otp: '',
  });
  const [validationResult, setValidationResult] = useState<ValidateOtpResponse | null>(null);
  const { toast } = useToast();

  const handleGenerateOtp = async () => {
    if (!generateData.user_phone || !/^\d{10}$/.test(generateData.user_phone)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await userApi.generateUserOtp(generateData);
      setValidateData(prev => ({ ...prev, user_phone: generateData.user_phone }));
      setStep('validate');
      toast({
        title: 'Success',
        description: 'OTP generated successfully. Please check your phone.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate OTP';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!validateData.user_otp) {
      toast({
        title: 'Error',
        description: 'Please enter the OTP',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await userApi.validateWithOtp(validateData);
      setValidationResult(result);
      setStep('result');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to validate OTP';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('generate');
    setGenerateData({
      user_type: 'admin',
      user_phone: '',
      user_role: 'admin',
    });
    setValidateData({
      user_phone: '',
      user_otp: '',
    });
    setValidationResult(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'validate') {
      setStep('generate');
    } else if (step === 'result') {
      setStep('validate');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setGenerateData({ ...generateData, user_phone: value });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValidateData({ ...validateData, user_otp: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Validate User OTP
          </DialogTitle>
          <DialogDescription>
            {step === 'generate' && 'Generate OTP for user validation'}
            {step === 'validate' && 'Enter the OTP received on your phone'}
            {step === 'result' && 'Validation Result'}
          </DialogDescription>
        </DialogHeader>

        {step === 'generate' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_type">User Type *</Label>
              <Select
                value={generateData.user_type}
                onValueChange={(value) => setGenerateData({ ...generateData, user_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="read_only">Read Only</SelectItem>
                  <SelectItem value="read_write">Read Write</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_phone">Phone Number *</Label>
              <Input
                id="user_phone"
                type="tel"
                value={generateData.user_phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_role">Role *</Label>
              <Select
                value={generateData.user_role}
                onValueChange={(value) => setGenerateData({ ...generateData, user_role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="picking">Picking</SelectItem>
                  <SelectItem value="in-bound">In-bound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerateOtp} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate OTP'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'validate' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_otp">Enter OTP *</Label>
              <Input
                id="user_otp"
                type="text"
                value={validateData.user_otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>

            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleValidateOtp} disabled={isLoading}>
                {isLoading ? 'Validating...' : 'Validate OTP'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'result' && validationResult && (
          <div className="space-y-4">
            <Card className={validationResult.statusbool ? "border-green-200" : "border-red-200"}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {validationResult.statusbool ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Validation Successful
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      Validation Failed
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={validationResult.statusbool ? "default" : "destructive"}>
                    {validationResult.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Message:</span>
                  <span className="text-sm text-right">{validationResult.message}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status Code:</span>
                  <Badge variant="outline">{validationResult.status_code}</Badge>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to OTP
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}