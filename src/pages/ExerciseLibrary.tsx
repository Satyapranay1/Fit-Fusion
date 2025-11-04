import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dumbbell, Search } from "lucide-react";

const exercises = [
  // Chest
  { id: 1, name: "Push-ups", muscle: "Chest", difficulty: "Beginner", equipment: "None" },
  { id: 2, name: "Bench Press", muscle: "Chest", difficulty: "Intermediate", equipment: "Barbell" },
  { id: 3, name: "Incline Dumbbell Press", muscle: "Chest", difficulty: "Intermediate", equipment: "Dumbbells" },
  { id: 4, name: "Chest Fly", muscle: "Chest", difficulty: "Intermediate", equipment: "Machine" },

  // Back
  { id: 5, name: "Pull-ups", muscle: "Back", difficulty: "Intermediate", equipment: "Pull-up Bar" },
  { id: 6, name: "Lat Pulldown", muscle: "Back", difficulty: "Beginner", equipment: "Machine" },
  { id: 7, name: "Deadlift", muscle: "Back", difficulty: "Advanced", equipment: "Barbell" },
  { id: 8, name: "Seated Row", muscle: "Back", difficulty: "Intermediate", equipment: "Cable" },

  // Legs
  { id: 9, name: "Squats", muscle: "Legs", difficulty: "Beginner", equipment: "None" },
  { id: 10, name: "Lunges", muscle: "Legs", difficulty: "Beginner", equipment: "None" },
  { id: 11, name: "Leg Press", muscle: "Legs", difficulty: "Intermediate", equipment: "Machine" },
  { id: 12, name: "Romanian Deadlift", muscle: "Legs", difficulty: "Intermediate", equipment: "Barbell" },
  { id: 13, name: "Calf Raises", muscle: "Legs", difficulty: "Beginner", equipment: "None" },

  // Core
  { id: 14, name: "Plank", muscle: "Core", difficulty: "Beginner", equipment: "None" },
  { id: 15, name: "Crunches", muscle: "Core", difficulty: "Beginner", equipment: "None" },
  { id: 16, name: "Hanging Leg Raise", muscle: "Core", difficulty: "Intermediate", equipment: "Pull-up Bar" },
  { id: 17, name: "Russian Twists", muscle: "Core", difficulty: "Intermediate", equipment: "None" },

  // Arms
  { id: 18, name: "Bicep Curls", muscle: "Arms", difficulty: "Beginner", equipment: "Dumbbells" },
  { id: 19, name: "Tricep Dips", muscle: "Arms", difficulty: "Intermediate", equipment: "Parallel Bars" },
  { id: 20, name: "Hammer Curls", muscle: "Arms", difficulty: "Beginner", equipment: "Dumbbells" },
  { id: 21, name: "Skull Crushers", muscle: "Arms", difficulty: "Intermediate", equipment: "Barbell" },

  // Shoulders
  { id: 22, name: "Overhead Press", muscle: "Shoulders", difficulty: "Intermediate", equipment: "Barbell" },
  { id: 23, name: "Lateral Raises", muscle: "Shoulders", difficulty: "Beginner", equipment: "Dumbbells" },
  { id: 24, name: "Arnold Press", muscle: "Shoulders", difficulty: "Intermediate", equipment: "Dumbbells" },
  { id: 25, name: "Front Raises", muscle: "Shoulders", difficulty: "Beginner", equipment: "Dumbbells" },

  // Full Body / Functional
  { id: 26, name: "Burpees", muscle: "Full Body", difficulty: "Intermediate", equipment: "None" },
  { id: 27, name: "Mountain Climbers", muscle: "Full Body", difficulty: "Beginner", equipment: "None" },
  { id: 28, name: "Kettlebell Swings", muscle: "Full Body", difficulty: "Intermediate", equipment: "Kettlebell" },
  { id: 29, name: "Clean and Press", muscle: "Full Body", difficulty: "Advanced", equipment: "Barbell" },
  { id: 30, name: "Jump Squats", muscle: "Full Body", difficulty: "Intermediate", equipment: "None" },
];

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [equipment, setEquipment] = useState("All");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = difficulty === "All" || exercise.difficulty === difficulty;
    const matchesEquipment = equipment === "All" || exercise.equipment === equipment;

    return matchesSearch && matchesDifficulty && matchesEquipment;
  });

  const uniqueEquipments = Array.from(new Set(exercises.map((e) => e.equipment)));

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
        <h1 className="text-4xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground text-lg">Explore 30+ exercises by muscle group, difficulty, and equipment</p>
      </div>

      {/* Search + Filters */}
      <Card className="glass">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises by name or muscle group..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Difficulties</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={equipment} onValueChange={setEquipment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Equipment</SelectItem>
                {uniqueEquipments.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {eq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="glass hover:shadow-lg transition-smooth cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg gradient-primary">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <Badge className={difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{exercise.name}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{exercise.muscle}</Badge>
                    <Badge variant="outline">{exercise.equipment}</Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to view detailed instructions, proper form tips, and video demonstrations.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredExercises.length === 0 && (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No exercises found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
    }
