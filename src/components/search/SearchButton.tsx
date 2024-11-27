import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SearchButton({ onClick, disabled }: SearchButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="hover:bg-secondary"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
} 