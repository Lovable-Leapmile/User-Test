import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUserData } from '@/lib/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => Promise<void>;
  initialData?: Partial<CreateUserData>;
  mode: 'create' | 'edit';
}

export function UserModal({ isOpen, onClose, onSubmit, initialData, mode }: UserModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    user_name: '',
    user_email: '',
    user_type: 'admin',
    user_phone: '',
    password: '',
    user_role: 'admin',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // For edit mode, only set the fields we want to allow editing
      setFormData(prev => ({
        ...prev,
        user_name: initialData.user_name || '',
        user_email: initialData.user_email || '',
        user_type: initialData.user_type || 'admin',
        user_phone: initialData.user_phone || '',
        user_role: initialData.user_role || 'admin',
        password: '' // Don't pre-fill password in edit mode
      }));
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        user_name: '',
        user_email: '',
        user_type: 'admin',
        user_phone: '',
        password: '',
        user_role: 'admin',
      });
    }
  }, [initialData, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create') {
      if (!formData.user_name.trim()) newErrors.user_name = 'Name is required';
      if (!formData.user_email.trim()) newErrors.user_email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) newErrors.user_email = 'Invalid email format';
      if (!formData.user_phone.trim()) newErrors.user_phone = 'Phone number is required';
      if (!/^\d{10}$/.test(formData.user_phone)) newErrors.user_phone = 'Phone number must be exactly 10 digits';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && (formData.password.length < 6 || formData.password.length > 10)) {
        newErrors.password = 'Password must be 6-10 characters';
      }
    }

    // For edit mode, only validate if fields are provided
    if (mode === 'edit') {
      if (formData.user_email && formData.user_email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
        newErrors.user_email = 'Invalid email format';
      }
      if (formData.user_phone && formData.user_phone.trim() !== '' && !/^\d{10}$/.test(formData.user_phone)) {
        newErrors.user_phone = 'Phone number must be exactly 10 digits';
      }
      if (formData.password && formData.password.trim() !== '' &&
          (formData.password.length < 6 || formData.password.length > 10)) {
        newErrors.password = 'Password must be 6-10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // For edit mode, create a clean object with only provided fields
      let submitData: CreateUserData;

      if (mode === 'edit') {
        submitData = {
          user_name: formData.user_name || '',
          user_email: formData.user_email || '',
          user_type: formData.user_type || '',
          user_phone: formData.user_phone || '',
          user_role: formData.user_role || '',
          password: formData.password || '',
        };
      } else {
        submitData = formData;
      }

      await onSubmit(submitData);
      onClose();
      // Reset form only after successful submission
      if (mode === 'create') {
        setFormData({
          user_name: '',
          user_email: '',
          user_type: 'admin',
          user_phone: '',
          password: '',
          user_role: 'admin',
        });
      }
      setErrors({});
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, user_phone: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new user to the system.' : 'Update user information. Only fill fields you want to change.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_name">
              Name {mode === 'create' && '*'}
            </Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              placeholder="Enter name"
            />
            {errors.user_name && <p className="text-sm text-destructive">{errors.user_name}</p>}
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Leave as is if you don't want to change</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_email">
              Email {mode === 'create' && '*'}
            </Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
              placeholder="Enter email"
            />
            {errors.user_email && <p className="text-sm text-destructive">{errors.user_email}</p>}
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Leave as is if you don't want to change</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_type">
              User Type {mode === 'create' && '*'}
            </Label>
            <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="read_only">Read Only</SelectItem>
                <SelectItem value="read_write">Read Write</SelectItem>
              </SelectContent>
            </Select>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Leave as is if you don't want to change</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_phone">
              Phone Number {mode === 'create' && '*'}
            </Label>
            <Input
              id="user_phone"
              type="tel"
              value={formData.user_phone}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit phone number"
              disabled={mode === 'edit'} // Disable phone number in edit mode
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
            )}
            {errors.user_phone && <p className="text-sm text-destructive">{errors.user_phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {mode === 'create' && '*'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={mode === 'create' ? "6-10 characters" : "Leave blank to keep current password"}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_role">
              Role {mode === 'create' && '*'}
            </Label>
            <Select value={formData.user_role} onValueChange={(value) => setFormData({ ...formData, user_role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="in-bound">In-bound</SelectItem>
                <SelectItem value="all-ops">All Ops</SelectItem>
              </SelectContent>
            </Select>
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Leave as is if you don't want to change</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}