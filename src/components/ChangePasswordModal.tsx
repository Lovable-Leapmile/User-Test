import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Loader2, KeyRound } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone?: string;
}

type Step = 'validate' | 'change-password';

export function ChangePasswordModal({ isOpen, onClose, userPhone }: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>('validate');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userPhone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleClose = () => {
    setStep('validate');
    setPhoneNumber(userPhone || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleValidatePassword = async () => {
    if (!phoneNumber || !currentPassword) {
      toast({
        title: 'Error',
        description: 'Please enter both phone number and current password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://testhostharan.leapmile.com/user/validate?user_phone=${phoneNumber}&password=${currentPassword}`
      );

      if (response.data.status === 'success' && response.data.statusbool) {
        toast({
          title: 'Success',
          description: 'Current password validated successfully',
        });
        setStep('change-password');
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to validate credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please enter both new password and confirmation',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 10) {
      toast({
        title: 'Error',
        description: 'Password must be between 6 and 10 characters',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.patch(
        `https://testhostharan.leapmile.com/user/user/change_password?user_phone=${phoneNumber}&password=${newPassword}`
      );

      if (response.data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        handleClose();
      } else {
        toast({
          title: 'Error',
          description: response.data.message || 'Failed to change password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            {step === 'validate'
              ? 'Enter your phone number and current password to continue'
              : 'Enter your new password (6-10 characters)'}
          </DialogDescription>
        </DialogHeader>

        {step === 'validate' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleValidatePassword} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validate
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (6-10 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                minLength={6}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                minLength={6}
                maxLength={10}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('validate')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button onClick={handleChangePassword} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
