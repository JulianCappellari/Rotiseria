"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getInventoryItems } from "@/features/inventory/inventory.service";
import {
  createRecipeItem,
  deleteRecipeItem,
  getRecipeByProduct,
} from "@/features/recipes/recipe.service";

import { PageHeader } from "@/components/layout/PageHeader";
import { SectionCard } from "@/components/layout/SectionCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductRecipePage() {
  const { productId } = useParams<{ productId: string }>();
  const queryClient = useQueryClient();

  const [inventoryItemId, setInventoryItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [wastePercentage, setWastePercentage] = useState("0");

  const { data: recipe = [] } = useQuery({
    queryKey: ["recipe", productId],
    queryFn: () => getRecipeByProduct(productId),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: getInventoryItems,
  });

  const createMutation = useMutation({
    mutationFn: createRecipeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", productId] });
      toast.success("Insumo agregado a la receta");
      setInventoryItemId("");
      setQuantity("");
      setWastePercentage("0");
    },
    onError: () => toast.error("No se pudo agregar el insumo"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", productId] });
      toast.success("Insumo eliminado de la receta");
    },
  });

  function handleAdd() {
    if (!inventoryItemId || Number(quantity) <= 0) {
      toast.error("Seleccioná insumo y cantidad válida");
      return;
    }

    createMutation.mutate({
      productId,
      inventoryItemId,
      quantity: Number(quantity),
      wastePercentage: Number(wastePercentage || 0),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receta del producto"
        description="Definí qué insumos consume este producto al venderse."
        backHref="/products"
      />

      <SectionCard
        title="Agregar insumo"
        icon={<BookOpen className="h-5 w-5 text-yellow-300" />}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_140px_140px_auto]">
          <div className="grid gap-2">
            <Label>Insumo</Label>
            <Select
              value={inventoryItemId}
              onValueChange={(value) => value && setInventoryItemId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar insumo" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.25"
            />
          </div>

          <div className="grid gap-2">
            <Label>Merma %</Label>
            <Input
              type="number"
              value={wastePercentage}
              onChange={(e) => setWastePercentage(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              Agregar
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Insumos de la receta">
        {recipe.length === 0 ? (
          <EmptyState message="Este producto todavía no tiene receta." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-yellow-700/40">
            <Table>
              <TableHeader>
                <TableRow className="border-yellow-700/30">
                  <TableHead className="text-yellow-300">Insumo</TableHead>
                  <TableHead className="text-yellow-300">Cantidad</TableHead>
                  <TableHead className="text-yellow-300">Merma</TableHead>
                  <TableHead className="text-right text-yellow-300">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recipe.map((item) => (
                  <TableRow key={item.id} className="border-yellow-700/30">
                    <TableCell className="font-medium text-yellow-50">
                      {item.inventoryItem.name}
                    </TableCell>
                    <TableCell className="text-yellow-100/80">
                      {item.quantity} {item.inventoryItem.unit.symbol}
                    </TableCell>
                    <TableCell className="text-yellow-100/80">
                      {item.wastePercentage}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
