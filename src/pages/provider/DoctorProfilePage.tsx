import { useCallback, useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Phone, Stethoscope, User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getMyDoctorProfile,
  updateMyDoctorPin,
  type DoctorProfile,
} from '@/lib/doctor-profile-api';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await getMyDoctorProfile());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      toast.error('Hai mã PIN không khớp');
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      toast.error('Mã PIN phải gồm 6 chữ số');
      return;
    }
    setChangingPin(true);
    try {
      await updateMyDoctorPin(newPin);
      toast.success('Đã cập nhật mã PIN ký duyệt');
      setNewPin('');
      setConfirmPin('');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setChangingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Không tải được hồ sơ bác sĩ.</p>;
  }

  const isPinLocked = profile.pin_locked_until
    && new Date(profile.pin_locked_until) > new Date();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hồ sơ bác sĩ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thông tin tài khoản và mã PIN ký duyệt hồ sơ bệnh án.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ProfileRow icon={<User className="h-4 w-4" />} label="Họ tên" value={profile.full_name ?? '—'} />
          <ProfileRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <ProfileRow icon={<Phone className="h-4 w-4" />} label="Điện thoại" value={profile.phone ?? '—'} />
          <ProfileRow icon={<Stethoscope className="h-4 w-4" />} label="Chuyên khoa" value={profile.specialty ?? '—'} />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">Trạng thái</span>
            <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
              {profile.status === 'active' ? 'Hoạt động' : profile.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Mã PIN ký duyệt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Dùng mã PIN này khi <strong>Hoàn tất &amp; Ký duyệt</strong> hồ sơ SOAP. Mã được cấp tự động khi tạo tài khoản bác sĩ.
          </p>

          {isPinLocked && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-xs">
                PIN bị khóa đến{' '}
                {format(parseISO(profile.pin_locked_until!), "HH:mm dd/MM/yyyy", { locale: vi })}
                {' '}do nhập sai nhiều lần.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Mã PIN hiện tại
              </p>
              <p className="font-mono text-2xl tracking-[0.4em]">
                {profile.sign_pin_plain
                  ? (showPin ? profile.sign_pin_plain : '••••••')
                  : '—'}
              </p>
              {profile.pin_set_at && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Cập nhật lúc {format(parseISO(profile.pin_set_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              )}
            </div>
            {profile.sign_pin_plain && (
              <Button variant="outline" size="icon" onClick={() => setShowPin(!showPin)}>
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold">Đổi mã PIN</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-pin">PIN mới (6 số)</Label>
                <Input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="font-mono tracking-widest"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pin">Xác nhận PIN</Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="font-mono tracking-widest"
                />
              </div>
            </div>
            <Button
              onClick={() => void handleChangePin()}
              disabled={changingPin || newPin.length !== 6 || confirmPin.length !== 6}
            >
              {changingPin && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Lưu PIN mới
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({
  icon, label, value,
}: {
  icon: React.ReactNode; label: string; value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
