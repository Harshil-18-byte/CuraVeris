import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="py-16 text-center flex flex-col items-center justify-center">
      <Icon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
      <h3 className="font-heading font-semibold text-lg text-neutral-900 text-center">
        {title}
      </h3>
      <p className="text-neutral-600 text-sm text-center mt-1 max-w-xs mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-6 mx-auto">
          {action.href ? (
            <Link href={action.href}>
              <Button size="md">{action.label}</Button>
            </Link>
          ) : (
            <Button size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
