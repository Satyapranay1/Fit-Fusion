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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, X, Pencil } from "lucide-react";
import { toast } from "sonner";

interface CustomWorkout {
  id: number;
  workoutName: string;
  description: string;
  sets: number;
  reps: number;
  exerciseName: string;
  type?: string;
}

export default function WorkoutBuilder() {
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [newWorkout, setNewWorkout] = useState({
    workoutName: "",
    description: "",
    sets: "",
    reps: "",
    exerciseName: "",
    type: "",
  });

  const backend = "https://health4-lmzi.onrender.com"; // ✅ Matches controller

  // Fetch workouts
  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backend}/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch workouts");
      const data = await res.json();
      setWorkouts(data);
    } catch (err: any) {
      toast.error(err.message || "Error fetching workouts");
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Save or Update Workout
  const handleSaveWorkout = async () => {
    const { workoutName, description, sets, reps, exerciseName, type } =
      newWorkout;
    if (!workoutName || !exerciseName || !sets || !reps) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      workoutName,
      description,
      sets: parseInt(sets),
      reps: parseInt(reps),
      exerciseName,
      type,
    };

    try {
      const token = localStorage.getItem("token");
      const endpoint = isEditing
        ? `${backend}/api/custom/update/${editId}`
        : `${backend}/api/custom/add`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(isEditing ? "Failed to update workout" : "Failed to save workout");

      const saved = await res.json();

      if (isEditing) {
        setWorkouts(workouts.map((w) => (w.id === editId ? saved : w)));
        toast.success("Workout updated!");
      } else {
        setWorkouts([saved, ...workouts]);
        toast.success("Workout saved!");
      }

      // Reset form
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setNewWorkout({
        workoutName: "",
        description: "",
        sets: "",
        reps: "",
        exerciseName: "",
        type: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Error saving workout");
    }
  };

  // Delete Workout
  const handleDeleteWorkout = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backend}/api/custom/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete workout");
      setWorkouts(workouts.filter((w) => w.id !== id));
      toast.success("Workout deleted!");
    } catch (err: any) {
      toast.error(err.message || "Error deleting workout");
    }
  };

  // Edit Workout
  const handleEditWorkout = (workout: CustomWorkout) => {
    setNewWorkout({
      workoutName: workout.workoutName,
      description: workout.description || "",
      sets: workout.sets.toString(),
      reps: workout.reps.toString(),
      exerciseName: workout.exerciseName,
      type: workout.type || "",
    });
    setEditId(workout.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const suggestedExercises = [
    "Push-ups",
    "Squats",
    "Bench Press",
    "Deadlift",
    "Pull-ups",
    "Bicep Curls",
    "Plank",
    "Lunges",
    "Shoulder Press",
    "Leg Press",
  ];

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
          <Dumbbell className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold">Custom Workout Builder</h1>
        <p className="text-muted-foreground text-lg">
          Create and manage your personalized workouts
        </p>
      </div>

      {/* Create button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setIsEditing(false);
              setEditId(null);
              setNewWorkout({
                workoutName: "",
                description: "",
                sets: "",
                reps: "",
                exerciseName: "",
                type: "",
              });
            }
          }}
          className="gradient-primary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Close Form" : "Create Workout"}
        </Button>
      </div>

      {/* Workout Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass shadow-lg">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Update Workout" : "Build Your Workout"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Modify your existing workout details"
                  : "Fill in details to create your custom workout"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Workout Name</Label>
                  <Input
                    placeholder="e.g., Upper Body Strength"
                    value={newWorkout.workoutName}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, workoutName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    placeholder="e.g., Strength, Cardio"
                    value={newWorkout.type}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, type: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description about this workout"
                    value={newWorkout.description}
                    onChange={(e) =>
                      setNewWorkout({
                        ...newWorkout,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2 border-t pt-4">
                  <Label>Exercise Name</Label>
                  <Input
                    placeholder="e.g., Push-ups"
                    value={newWorkout.exerciseName}
                    onChange={(e) =>
                      setNewWorkout({
                        ...newWorkout,
                        exerciseName: e.target.value,
                      })
                    }
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedExercises.map((ex) => (
                      <Badge
                        key={ex}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-white"
                        onClick={() =>
                          setNewWorkout({ ...newWorkout, exerciseName: ex })
                        }
                      >
                        {ex}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={newWorkout.sets}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, sets: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newWorkout.reps}
                    onChange={(e) =>
                      setNewWorkout({ ...newWorkout, reps: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveWorkout}
                  className="gradient-primary text-white"
                >
                  {isEditing ? "Update Workout" : "Save Workout"}
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setEditId(null);
                    setNewWorkout({
                      workoutName: "",
                      description: "",
                      sets: "",
                      reps: "",
                      exerciseName: "",
                      type: "",
                    });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Display Workouts */}
      <div className="grid md:grid-cols-2 gap-6">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass hover:shadow-lg transition-smooth">
              <CardHeader>
                <CardTitle>{workout.workoutName}</CardTitle>
                {workout.description && (
                  <CardDescription>{workout.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Exercise:</strong> {workout.exerciseName}
                  </p>
                  <p className="text-sm">
                    <strong>Sets:</strong> {workout.sets} ×{" "}
                    <strong>Reps:</strong> {workout.reps}
                  </p>
                  {workout.type && (
                    <p className="text-xs text-muted-foreground">
                      Type: {workout.type}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditWorkout(workout)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {workouts.length === 0 && !showForm && (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No custom workouts yet. Create your first one!
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
