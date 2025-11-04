import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import dayjs from "dayjs";

// ✅ Base API URL for backend (Spring Boot)
const backend = "https://health4-lmzi.onrender.com";

export default function Water() {
  const dailyGoal = 2000; // ml
  const [intake, setIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recordId, setRecordId] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // ✅ Fetch water data for selected date
  const fetchWaterData = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryDate = dayjs(selectedDate).format("YYYY-MM-DD");

      const res = await fetch(`${backend}/api/water/list?date=${queryDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load water data");

      const data = await res.json();
      if (data && data.length > 0) {
        const record = data[0];
        setIntake(record.amountLiters * 1000);
        setRecordId(record.id);
      } else {
        setIntake(0);
        setRecordId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load water data");
    }
  };

  useEffect(() => {
    fetchWaterData();
  }, [selectedDate]);

  // ✅ Save or update water record
  const saveWater = async (newIntake: number) => {
    const token = localStorage.getItem("token");
    const payload = {
      amountLiters: newIntake / 1000,
      goalLiters: dailyGoal / 1000,
      date: dayjs(selectedDate).format("YYYY-MM-DD"),
    };

    try {
      let res;
      if (recordId) {
        // PATCH existing record
        res = await fetch(`${backend}/api/water/update/${recordId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // POST new record
        res = await fetch(`${backend}/api/water/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save water data");

      const saved = await res.json();
      setRecordId(saved.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save water data");
    }
  };

  // ✅ Add water intake
  const addWaterIntake = async (amount: number) => {
    const newIntake = intake + amount;
    setIntake(newIntake);
    toast.success(`Added ${amount}ml of water`);
    await saveWater(newIntake);
    if (newIntake >= dailyGoal && intake < dailyGoal) {
      toast.success("🎉 Daily water goal achieved!");
    }
  };

  // ✅ Remove water intake
  const removeWaterIntake = async (amount: number) => {
    const newIntake = Math.max(0, intake - amount);
    setIntake(newIntake);
    toast.info(`Removed ${amount}ml`);
    await saveWater(newIntake);
  };

  // ✅ Progress calculation
  const percentage = Math.min((intake / dailyGoal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 max-w-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1 space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block gradient-accent p-4 rounded-2xl shadow-glow mb-4"
          >
            <Droplets className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold">Water Intake Tracker</h1>
          <p className="text-muted-foreground text-lg">
            Stay hydrated throughout the day
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowCalendar(!showCalendar)}
          className="ml-4"
        >
          <Calendar className="h-5 w-5 mr-1" />
          {dayjs(selectedDate).format("MMM D")}
        </Button>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <Card className="glass p-3">
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

      {/* Progress Card */}
      <Card className="glass shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            Progress for {dayjs(selectedDate).format("MMM D, YYYY")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
  <div className="text-center space-y-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
    >
      {intake}ml
    </motion.div>

            <p className="text-muted-foreground">of {dailyGoal}ml goal</p>
            <Progress value={percentage} className="h-4" />

            <p className="text-sm text-muted-foreground">
              {percentage.toFixed(0)}% of daily goal •{" "}
              {dailyGoal - intake > 0
                ? `${dailyGoal - intake}ml remaining`
                : "Goal achieved! 🎉"}
            </p>
          </div>

          {/* ✅ Custom Manual Input */}
          <div className="space-y-3 text-center">
  <p className="text-sm text-muted-foreground">Add Custom Amount (ml)</p>
  <div className="flex items-center justify-center gap-3">
    <input
      type="number"
      value={customAmount}
      onChange={(e) => setCustomAmount(e.target.value)}
      className="w-32 px-3 py-2 text-center rounded-lg border border-gray-600 bg-gray-900 text-gray-100 placeholder-gray-400 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      min="0"
      step="50"
    />
    <Button
      onClick={async () => {
        if (!customAmount) return toast.error("Enter a value first");
        await addWaterIntake(Number(customAmount));
        setCustomAmount("");
      }}
      className="gradient-accent text-white hover:shadow-glow transition-all duration-200"
    >
      Add
    </Button>
  </div>
</div>


          {/* Quick Add / Remove */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Quick Add
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => addWaterIntake(250)}
                  className="gradient-accent text-white"
                >
                  <Plus className="mr-1 h-4 w-4" />250ml
                </Button>
                <Button
                  onClick={() => addWaterIntake(500)}
                  className="gradient-accent text-white"
                >
                  <Plus className="mr-1 h-4 w-4" />500ml
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Quick Remove
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => removeWaterIntake(250)}
                  variant="outline"
                >
                  <Minus className="mr-1 h-4 w-4" />250ml
                </Button>
                <Button
                  onClick={() => removeWaterIntake(500)}
                  variant="outline"
                >
                  <Minus className="mr-1 h-4 w-4" />500ml
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={async () => {
              setIntake(0);
              await saveWater(0);
              toast.info("Reset for today");
            }}
            variant="outline"
            className="w-full"
          >
            Reset Day
          </Button>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="glass">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold">💧 Hydration Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Drink a glass of water when you wake up</li>
              <li>Keep a bottle with you throughout the day</li>
              <li>Drink water before and after workouts</li>
              <li>Set reminders to hydrate</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
