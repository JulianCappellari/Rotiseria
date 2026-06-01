"use client";

import { useRouter } from "next/navigation";
import { BookOpen, MoreHorizontal, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Product } from "@/types/product";
import { deleteProduct } from "./product.service";
import { ProductEditDialog } from "./ProductEditDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  product: Product;
};

export function ProductActions({ product }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto desactivado");
    },
    onError: () => toast.error("No se pudo desactivar"),
  });

  function handleDelete() {
    if (!confirm(`¿Desactivar "${product.name}"?`)) return;
    mutation.mutate(product.id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-yellow-300 hover:bg-yellow-500/10">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <ProductEditDialog product={product} />

        <DropdownMenuItem
          onClick={() => router.push(`/products/${product.id}/recipe`)}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Editar receta
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Desactivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}