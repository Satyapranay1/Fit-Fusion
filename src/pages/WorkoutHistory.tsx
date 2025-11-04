import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dumbbell,
  Clock,
  Calendar,
  XCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface WorkoutRecord {
  id: number;
  weight: number;
  height: number;
  gender: string;
  age: number;
  predictedPlan: string;
  createdAt: string;
  planJson?: any;
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecord | null>(
    null
  );
  const [completedDays, setCompletedDays] = useState<{ [key: string]: boolean }>({});

  const backend = "https://health4-lmzi.onrender.com";

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backend}/api/workout/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(res.data);
    } catch (err) {
      toast.error("Failed to fetch workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleComplete = (weekIdx: number, dayIdx: number) => {
    const key = `${weekIdx}-${dayIdx}`;
    setCompletedDays((prev) => ({ ...prev, [key]: true }));
    toast.success("Workout marked as completed! 💪");
  };

  const gradients = [
    "from-cyan-500/20 to-blue-700/10",
    "from-purple-500/20 to-indigo-700/10",
    "from-pink-500/20 to-red-700/10",
    "from-green-500/20 to-emerald-700/10",
  ];

  // Compact JSON (fallback)
  const formatCompactJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return "Invalid JSON";
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
          <Dumbbell className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold">Workout History</h1>
        <p className="text-muted-foreground text-lg">
          Your previously generated workout plans
        </p>
      </div>

      {/* Loading / Grid */}
      {loading ? (
        <p className="text-center text-muted-foreground">Loading workouts...</p>
      ) : workouts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-3 text-xl font-extrabold">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 120 }}
                      className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-md"
                    >
                      <Dumbbell className="h-5 w-5" />
                    </motion.div>

                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-sm">
                      {`Workout Plan ${index + 1}`}
                    </span>
                  </CardTitle>

                  <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(workout.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{workout.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="font-medium">{workout.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gender:</span>
                    <span className="font-medium capitalize">
                      {workout.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Age:</span>
                    <span className="font-medium">{workout.age}</span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <Clock className="h-4 w-4" /> Completed
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedWorkout(workout)}
                      className="hover:bg-primary hover:text-white transition-all"
                    >
                      View Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No workouts found yet. Generate your first plan!
            </p>
          </CardContent>
        </Card>
      )}

      {/* 🧠 Workout Details Modal */}
      <Dialog
        open={!!selectedWorkout}
        onOpenChange={() => setSelectedWorkout(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWorkout && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                      <Info className="h-5 w-5 text-primary" />
                      {`Workout Plan ${
                        workouts.findIndex((w) => w.id === selectedWorkout.id) + 1
                      }`}
                    </DialogTitle>

                    <DialogDescription>
                      Created on{" "}
                      {new Date(selectedWorkout.createdAt).toLocaleDateString()}
                    </DialogDescription>
                  </div>
                  <XCircle
                    className="h-6 w-6 text-muted-foreground cursor-pointer"
                    onClick={() => setSelectedWorkout(null)}
                  />
                </div>
              </DialogHeader>

              {/* 👇 Beautiful Plan UI */}
              {selectedWorkout.planJson ? (
                <div className="mt-6 space-y-10">
                  {selectedWorkout.planJson.monthly_plan?.map(
                    (week: any, wi: number) => (
                      <motion.div
                        key={wi}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: wi * 0.2 }}
                        className={`rounded-2xl p-6 border border-gray-800 bg-gradient-to-br ${gradients[wi % gradients.length]} backdrop-blur-xl shadow-xl hover:shadow-cyan-500/10`}
                      >
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                          <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5" /> {week.focus}
                          </h3>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-4 w-4" /> Week {wi + 1}
                          </span>
                        </div>

                        <div className="space-y-6">
                          {week.plan.map((day: any, di: number) => {
                            const isCompleted = completedDays[`${wi}-${di}`];
                            return (
                              <motion.div
                                key={di}
                                whileHover={{ scale: 1.02 }}
                                className="rounded-xl p-5 border border-gray-800 bg-gray-900/40 backdrop-blur-lg shadow-lg transition-all"
                              >
                                <div className="flex flex-wrap items-center justify-between mb-4">
                                  <h4 className="text-lg font-semibold text-gray-100">
                                    📅 {day.day} —{" "}
                                    <span className="text-sm text-gray-400">
                                      {day.intensity} Intensity
                                    </span>
                                  </h4>
                                  <Button
                                    size="sm"
                                    disabled={isCompleted}
                                    onClick={() => handleComplete(wi, di)}
                                    className={`rounded-full ${
                                      isCompleted
                                        ? "bg-green-600 text-white hover:bg-green-600"
                                        : "bg-cyan-600 hover:bg-cyan-700"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    ) : null}
                                    {isCompleted ? "Completed" : "Mark Complete"}
                                  </Button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                  {day.details.map((ex: any, ei: number) => (
                                    <motion.div
                                      key={ei}
                                      whileHover={{ scale: 1.03 }}
                                      className="p-4 rounded-lg border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 transition-all"
                                    >
                                      <p className="text-cyan-300 font-medium mb-1">
                                        🏋️ {ex.exercise}
                                      </p>
                                      <p className="text-gray-300 text-sm mb-1">
                                        👉 {ex.how_to_do}
                                      </p>
                                      <p className="text-gray-400 text-xs italic mb-1">
                                        💬 {ex.why_to_do}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        🔥 {ex.estimated_calories} kcal
                                      </p>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-5 bg-gray-900/50 text-gray-300 rounded-lg p-4 border border-gray-700 font-mono text-xs">
                  <pre className="whitespace-pre-wrap break-all">
                    {formatCompactJSON(selectedWorkout.planJson)}
                  </pre>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
