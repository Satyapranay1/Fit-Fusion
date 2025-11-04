import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  Pencil,
  Save,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Goal {
  id: number;
  goalType: string;
  targetValue: number;
  currentValue: number;
  deadline?: string | null;
  status: "pending" | "completed";
  createdDate?: string;
}

const backend = "https://health4-lmzi.onrender.com";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goalType: "",
    targetValue: "",
    deadline: "",
    status: "pending",
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editDeadlineCalendar, setEditDeadlineCalendar] = useState(false);

  // ✅ Fetch goals
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = backend + "/api/goals";
      if (!showAll) {
        const queryDate = dayjs(selectedDate).format("YYYY-MM-DD");
        url += `?date=${queryDate}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(res.data);
    } catch {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedDate, showAll]);

  // ✅ Add new goal
  const handleAddGoal = async () => {
    if (!newGoal.goalType || !newGoal.targetValue) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      goalType: newGoal.goalType,
      targetValue: parseFloat(newGoal.targetValue),
      currentValue: 0,
      deadline: newGoal.deadline || null,
      status: newGoal.status || "pending",
      createdDate: dayjs(selectedDate).format("YYYY-MM-DD"),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backend}/api/goals`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals([...goals, res.data]);
      toast.success("Goal added successfully!");
      setShowForm(false);
      setNewGoal({ goalType: "", targetValue: "", deadline: "", status: "pending" });
    } catch {
      toast.error("Failed to create goal");
    }
  };

  // ✅ Delete goal
  const handleDeleteGoal = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backend}/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter((g) => g.id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  // ✅ Save updated goal
  const handleSaveGoal = async () => {
    if (!editingGoal) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${backend}/api/goals/${editingGoal.id}`,
        editingGoal,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(goals.map((g) => (g.id === editingGoal.id ? res.data : g)));
      setEditingGoal(null);
      toast.success("Goal updated successfully!");
    } catch {
      toast.error("Failed to update goal");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block gradient-primary p-4 rounded-2xl shadow-glow mb-4"
        >
          <Target className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold">Goals</h1>
        <p className="text-muted-foreground text-lg">
          Set, edit, and track your fitness goals
        </p>
      </div>

      {/* Date Picker & Toggle */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <Calendar className="h-5 w-5 mr-2" />
            {dayjs(selectedDate).format("MMM D, YYYY")}
          </Button>

          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-500" />
            <Switch checked={showAll} onCheckedChange={setShowAll} />
            <span className="text-sm text-gray-600">Show All</span>
          </div>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      {/* Calendar Filter */}
      {showCalendar && (
        <Card className="glass p-3 mt-3">
          <CalendarComp
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date || new Date());
              setShowCalendar(false);
            }}
          />
        </Card>
      )}

      {/* Add Goal Form */}
      {showForm && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Goal Type</Label>
                <Input
                  value={newGoal.goalType}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, goalType: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Target Value</Label>
                <Input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetValue: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <Label>Deadline</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setEditDeadlineCalendar(!editDeadlineCalendar)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {newGoal.deadline
                    ? dayjs(newGoal.deadline).format("MMM D, YYYY")
                    : "Pick a date"}
                </Button>
                {editDeadlineCalendar && (
                  <Card className="absolute z-10 mt-2 p-3 glass">
                    <CalendarComp
                      mode="single"
                      selected={
                        newGoal.deadline ? new Date(newGoal.deadline) : undefined
                      }
                      onSelect={(date) => {
                        if (date)
                          setNewGoal({
                            ...newGoal,
                            deadline: dayjs(date).format("YYYY-MM-DD"),
                          });
                        setEditDeadlineCalendar(false);
                      }}
                    />
                  </Card>
                )}
              </div>

              {/* ✅ Status Toggle */}
              <div className="flex items-center gap-3 mt-3">
                <Label>Status</Label>
                <Switch
                  checked={newGoal.status === "completed"}
                  onCheckedChange={(checked) =>
                    setNewGoal({
                      ...newGoal,
                      status: checked ? "completed" : "pending",
                    })
                  }
                />
                <span>
                  {newGoal.status === "completed" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddGoal}
                className="gradient-primary text-white"
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="glass">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {goal.status === "completed" ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-yellow-500 h-5 w-5" />
                    )}
                    {editingGoal?.id === goal.id ? (
                      <Input
                        value={editingGoal.goalType}
                        onChange={(e) =>
                          setEditingGoal({
                            ...editingGoal,
                            goalType: e.target.value,
                          })
                        }
                      />
                    ) : (
                      goal.goalType
                    )}
                  </CardTitle>
                  <CardDescription>
                    {goal.createdDate && (
                      <p className="text-xs text-gray-400">
                        Created {dayjs(goal.createdDate).fromNow()}
                      </p>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {editingGoal?.id === goal.id ? (
                <>
                  <div className="grid gap-3">
                    <div>
                      <Label>Target</Label>
                      <Input
                        type="number"
                        value={editingGoal.targetValue}
                        onChange={(e) =>
                          setEditingGoal({
                            ...editingGoal,
                            targetValue: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>

                    {/* ✅ Edit Status Toggle */}
                    <div className="flex items-center gap-2 mt-3">
                      <Label>Status</Label>
                      <Switch
                        checked={editingGoal.status === "completed"}
                        onCheckedChange={(checked) =>
                          setEditingGoal({
                            ...editingGoal,
                            status: checked ? "completed" : "pending",
                          })
                        }
                      />
                      <span>
                        {editingGoal.status === "completed"
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleSaveGoal}
                      className="bg-green-600 text-white"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingGoal(null)}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Target:</strong> {goal.targetValue}
                  </p>
                  {goal.deadline && (
                    <p>
                      <strong>Deadline:</strong>{" "}
                      {dayjs(goal.deadline).format("MMM D, YYYY")}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        goal.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {goal.status}
                    </span>
                  </p>
                  <Button
                    onClick={() => setEditingGoal(goal)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
