/**
 * FR-010: ICD-10 manual search panel
 * Allows doctors to search and add ICD codes outside of AI suggestions
 */

import { Plus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type IcdSearchPanelProps = {
  search: string;
  results: { code: string; name: string }[];
  loading: boolean;
  existingCodes: string[];
  onSearch: (q: string) => void;
  onAdd: (code: string, name: string) => void;
};

export default function IcdSearchPanel({
  search, results, loading, existingCodes, onSearch, onAdd,
}: IcdSearchPanelProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Tìm mã ICD (VD: J06, cảm cúm...)"
          className="pl-8 h-8 text-xs"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang tìm...
        </div>
      )}

      {!loading && search.length >= 2 && results.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Không tìm thấy mã ICD phù hợp.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((item) => {
            const isAdded = existingCodes.includes(item.code);
            return (
              <div
                key={item.code}
                className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-card hover:bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-primary block">{item.code}</span>
                  <span className="text-[11px] text-foreground leading-snug">{item.name}</span>
                </div>
                <Button
                  size="sm"
                  variant={isAdded ? 'secondary' : 'default'}
                  className="h-6 text-[10px] px-2 shrink-0"
                  disabled={isAdded}
                  onClick={() => onAdd(item.code, item.name)}
                >
                  {isAdded ? 'Đã thêm' : <><Plus className="h-3 w-3 mr-0.5" />Thêm</>}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {!search && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nhập tên bệnh hoặc mã ICD để tìm kiếm.
        </p>
      )}
    </div>
  );
}
