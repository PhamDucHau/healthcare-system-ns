import { useEffect, useState } from 'react';
import { Heart, Stethoscope, Baby, Shield, Brain, Bone, Ear, Eye, Loader2 } from 'lucide-react';
import { fetchSpecialties } from '@/lib/appointment-api';
import type { Specialty } from '@/types/appointment';

const ICON_MAP: Record<string, React.ElementType> = {
  'heart-pulse':  Heart,
  'stethoscope':  Stethoscope,
  'baby':         Baby,
  'shield':       Shield,
  'brain':        Brain,
  'bone':         Bone,
  'ear':          Ear,
  'eye':          Eye,
};

const ICON_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-amber-100 text-amber-600',
  'bg-cyan-100 text-cyan-600',
  'bg-indigo-100 text-indigo-600',
];

type Props = {
  onSelect: (specialty: Specialty) => void;
};

export default function BookingStep1({ onSelect }: Props) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecialties()
      .then(setSpecialties)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Không thể tải danh sách chuyên khoa. {error}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-5">
        Chọn chuyên khoa bạn muốn đặt khám.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {specialties.map((s, idx) => {
          const Icon = ICON_MAP[s.icon ?? ''] ?? Stethoscope;
          const colorCls = ICON_COLORS[idx % ICON_COLORS.length]!;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center hover:border-primary hover:shadow-sm transition-all"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorCls} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-foreground leading-tight">
                {s.name}
              </span>
              {s.description && (
                <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                  {s.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
