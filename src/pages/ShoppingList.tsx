import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Pencil, Save, ShoppingCart } from "lucide-react";

interface ShoppingItem {
  id: string;
  itemName: string;
  quantity: number;
  checked?: boolean;
  isEditing?: boolean;
}

const backend = "https://health4-lmzi.onrender.com";

export default function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${backend}/api/cart/all`, getAuthHeader());
      setItems(res.data);
    } catch {
      toast.error("Failed to fetch items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newItemName.trim() || newQuantity < 1) {
      toast.error("Enter valid name and quantity");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${backend}/api/cart/add`,
        { itemName: newItemName, quantity: newQuantity },
        getAuthHeader()
      );
      setItems([...items, res.data]);
      setNewItemName("");
      setNewQuantity(1);
      toast.success("Item added!");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleSave = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      const res = await axios.patch(
        `${backend}/api/cart/update/${id}`,
        { itemName: item.itemName, quantity: item.quantity },
        getAuthHeader()
      );
      setItems(items.map((i) => (i.id === id ? { ...res.data, isEditing: false } : i)));
      toast.success("Item updated!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${backend}/api/cart/delete/${id}`, getAuthHeader());
      setItems(items.filter((i) => i.id !== id));
      toast.success("Deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const clearCompleted = async () => {
    try {
      const completed = items.filter((i) => i.checked);
      for (const item of completed) {
        await axios.delete(`${backend}/api/cart/delete/${item.id}`, getAuthHeader());
      }
      setItems(items.filter((i) => !i.checked));
      toast.success("Cleared completed items");
    } catch {
      toast.error("Failed to clear");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 gradient-primary opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(52,211,153,0.3),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-block gradient-primary p-4 rounded-2xl shadow-glow mb-4"
          >
            <ShoppingCart className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            FitFusion{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Shopping
            </span>
          </h1>
          <p className="text-muted-foreground">
            Manage your grocery and essentials effortlessly
          </p>
        </div>

        {/* Main Shopping Card */}
        <Card className="glass shadow-lg border border-emerald-300/40">
          <CardHeader>
            <CardTitle className="text-2xl flex justify-between items-center">
              Your Shopping List
              <Button
                variant="outline"
                onClick={clearCompleted}
                className="text-emerald-600 border-emerald-400 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-neutral-800"
              >
                Clear Completed
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Row */}
            <div className="flex gap-3">
              <Input
                placeholder="Enter item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 dark:bg-neutral-800 dark:text-white"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Input
                type="number"
                min={1}
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="w-24 text-center dark:bg-neutral-800 dark:text-white"
              />
              <Button
                disabled={loading}
                onClick={handleAdd}
                className="gradient-primary text-white shadow-glow"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Items List */}
            <div className="space-y-4 mt-6">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  🛒 No items yet. Add one above!
                </p>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        item.checked
                          ? "bg-emerald-100/70 dark:bg-neutral-800"
                          : "bg-white/80 dark:bg-neutral-900"
                      } shadow-sm hover:shadow-md`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleCheck(item.id)}
                        />

                        {item.isEditing ? (
                          <div className="flex gap-2 w-full">
                            <Input
                              value={item.itemName}
                              onChange={(e) =>
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id ? { ...i, itemName: e.target.value } : i
                                  )
                                )
                              }
                              className="flex-1 dark:bg-neutral-700 dark:text-white"
                            />
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, quantity: Number(e.target.value) }
                                      : i
                                  )
                                )
                              }
                              className="w-24 text-center dark:bg-neutral-700 dark:text-white"
                            />
                            <Button
                              onClick={() => handleSave(item.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                              size="icon"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`flex-1 text-lg ${
                                item.checked
                                  ? "line-through text-gray-400"
                                  : "text-gray-900 dark:text-gray-100 font-medium"
                              }`}
                            >
                              {item.itemName}{" "}
                              <span className="text-gray-500 text-sm">
                                (x{item.quantity})
                              </span>
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setItems(
                                  items.map((i) =>
                                    i.id === item.id ? { ...i, isEditing: true } : i
                                  )
                                )
                              }
                            >
                              <Pencil className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
