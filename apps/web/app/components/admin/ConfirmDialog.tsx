"use client";

import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "accent"} onClick={onConfirm}>
            {danger ? <AlertTriangle size={14} /> : null}
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
