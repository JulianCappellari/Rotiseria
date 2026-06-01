"use client";

import { DatabaseBackup } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createBackup, getBackups } from "./backup.service";
import { formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function BackupPanel() {
  const queryClient = useQueryClient();

  const { data: backups = [] } = useQuery({
    queryKey: ["backups"],
    queryFn: getBackups,
  });

  const mutation = useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      toast.success("Backup creado correctamente");
    },
    onError: () => {
      toast.error("No se pudo crear el backup");
    },
  });

  return (
    <SectionCard
      title="Backups de seguridad"
      icon={<DatabaseBackup className="h-5 w-5 text-yellow-300" />}
    >
      <div className="mb-4 flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Creando..." : "Crear backup"}
        </Button>
      </div>

      {backups.length === 0 ? (
        <EmptyState message="Todavía no hay backups creados." />
      ) : (
        <div className="space-y-3">
          {backups.map((backup) => (
            <div
              key={backup.filename}
              className="flex flex-col justify-between gap-2 rounded-xl border border-yellow-700/30 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="font-medium text-yellow-50">{backup.filename}</p>
                <p className="text-sm text-yellow-100/60">
                  {formatDateTime(backup.createdAt)}
                </p>
              </div>

              <p className="text-sm text-yellow-300">
                {formatSize(backup.sizeInBytes)}
              </p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}