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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Apple, Sparkles, Lightbulb, Utensils } from "lucide-react";
import { toast } from "sonner";

export default function Diet() {
  const [input, setInput] = useState({
    Age: "",
    Gender: "",
    Weight_kg: "",
    Height_cm: "",
    BMI: "",
    Disease_Type: "",
    Physical_Activity_Level: "",
    Daily_Caloric_Intake: "",
    Dietary_Restrictions: "",
    Allergies: "",
    Preferred_Cuisine: "",
    Weekly_Exercise_Hours: "",
  });

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const backend = "https://health4-lmzi.onrender.com";

  // 🧮 Auto-calculate BMI
  useEffect(() => {
    if (input.Weight_kg && input.Height_cm) {
      const h = Number(input.Height_cm) / 100;
      const bmi = (Number(input.Weight_kg) / (h * h)).toFixed(1);
      setInput((prev) => ({ ...prev, BMI: bmi }));
    }
  }, [input.Weight_kg, input.Height_cm]);

  const handleChange = (key: string, value: any) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = async () => {
    if (!input.Gender || !input.Age || !input.Weight_kg || !input.Height_cm) {
      toast.error("Please fill all required fields!");
      return;
    }

    const token = localStorage.getItem("token");
    const body = {
      ...input,
      Age: Number(input.Age),
      Weight_kg: Number(input.Weight_kg),
      Height_cm: Number(input.Height_cm),
      BMI: Number(input.BMI),
      Daily_Caloric_Intake: Number(input.Daily_Caloric_Intake || 2200),
      Weekly_Exercise_Hours: Number(input.Weekly_Exercise_Hours || 3),
    };

    try {
      setLoading(true);
      toast.loading("🍏 Generating your AI-powered diet plan...");

      const res = await fetch(`${backend}/api/diet/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      toast.dismiss();

      if (!res.ok) {
        console.error("❌ Diet API Error:", data);
        toast.error(`Error: ${data.error || "Failed to generate plan"}`);
        return;
      }

      setPlan(data.plan || data.diet || data);
      toast.success("🥗 Diet Plan Generated Successfully!");
    } catch (err: any) {
      toast.dismiss();
      console.error("Diet generation error:", err);
      toast.error("Failed to generate diet plan. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-gray-900 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(180,0,255,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(140,0,255,0.15),transparent_50%)]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-10"
      >
        <div className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl shadow-purple-500/40 mb-4">
          <Apple className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">
          AI-Generated <span className="text-purple-400">Diet Plan</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Smarter nutrition built for your body and lifestyle
        </p>
      </motion.div>

      {/* Form */}
      <Card className="relative z-10 bg-gray-900/50 border border-purple-500/30 shadow-xl rounded-2xl backdrop-blur-lg w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-purple-400 text-center text-2xl">
            Health Details
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Fill your details to generate a personalized diet plan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {[
            ["Age", "number", "in years"],
            ["Weight_kg", "number", "in kg"],
            ["Height_cm", "number", "in cm"],
            ["BMI", "number", "auto-calculated"],
            ["Daily_Caloric_Intake", "number", "e.g., 2200"],
            ["Weekly_Exercise_Hours", "number", "e.g., 4.5"],
          ].map(([key, type, placeholder]) => (
            <div key={key}>
              <Label className="text-gray-300">{key.replace(/_/g, " ")}</Label>
              <Input
                type={type}
                value={(input as any)[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                disabled={key === "BMI"}
                className="bg-gray-800/50 border-purple-700/50 text-gray-100"
              />
            </div>
          ))}

          {[
            ["Gender", ["Male", "Female"]],
            ["Disease_Type", ["None", "Diabetes", "Hypertension", "Obesity", "Other"]],
            ["Physical_Activity_Level", ["Sedentary", "Moderate", "Active"]],
            ["Dietary_Restrictions", ["None", "Low_Sugar", "Low_Sodium", "Other"]],
            ["Allergies", ["None", "Peanuts", "Gluten", "Other"]],
            ["Preferred_Cuisine", ["Indian", "Chinese", "Italian", "Mexican"]],
          ].map(([key, values]: [string, string[]]) => (
            <div key={key}>
              <Label className="text-gray-300">{key.replace(/_/g, " ")}</Label>
              <Select
                value={(input as any)[key]}
                onValueChange={(v) => handleChange(key, v)}
              >
                <SelectTrigger className="bg-gray-800/50 border-purple-700/50 text-gray-100">
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-gray-100 border-purple-800/40">
                  {values.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>

        <div className="p-6 pt-0">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl py-2 shadow-lg hover:shadow-purple-400/20 transition-all"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Diet Plan"}
          </Button>
        </div>
      </Card>

      {/* Plan Display */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mt-10 w-full max-w-5xl space-y-6"
        >
          <Card className="bg-gray-900/60 border border-purple-500/40 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                {plan.diet_type || "Balanced"} Diet
              </CardTitle>
              <CardDescription className="text-gray-400">
                Balanced, AI-curated plan crafted just for you
              </CardDescription>
            </CardHeader>
          </Card>

          {plan.weekly_diet_plan?.map((day: any, i: number) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-6 border border-purple-800/50 bg-gray-900/40 backdrop-blur-lg shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-purple-800/40 pb-3 mb-4">
                <h3 className="text-lg font-semibold text-purple-300">{day.day}</h3>
                <p className="text-sm text-gray-500">🍽 {day.meals.length} meals</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {day.meals.map((meal: any, mi: number) => (
                  <div
                    key={mi}
                    className="p-4 rounded-xl border border-purple-800/50 bg-gray-800/40 hover:bg-gray-800/70 transition-all"
                  >
                    <p className="text-purple-300 font-semibold mb-1">
                      🍱 {meal.meal}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      {meal.food_items.join(", ")}
                    </p>
                    <p className="text-gray-400 text-xs italic mb-1">
                      💬 {meal.why_to_eat}
                    </p>
                    <p className="text-gray-400 text-xs">
                      🔥 {meal.estimated_calories} kcal
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {plan.tips?.length > 0 && (
            <Card className="bg-gray-900/50 border border-purple-600/40 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Lightbulb className="h-5 w-5" /> Healthy Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  {plan.tips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
