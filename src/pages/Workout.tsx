import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Activity, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Workout() {
  const [formData, setFormData] = useState({
    Weight: "",
    Height: "",
    BMI: "",
    Gender: "",
    Age: "",
    BMIcase: "",
    AgeGroup: "",
  });
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const gradients = [
    "from-cyan-600/30 to-indigo-700/20",
    "from-purple-600/30 to-pink-700/20",
    "from-indigo-600/30 to-cyan-700/20",
    "from-blue-600/30 to-purple-700/20",
  ];

  const computeBMICase = (bmi: number) => {
    if (bmi < 16) return "Severe Thinness";
    if (bmi < 17) return "Moderate Thinness";
    if (bmi < 18.5) return "Mild Thinness";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obese";
    return "Severe Obese";
  };

  useEffect(() => {
    if (formData.Weight && formData.Height) {
      const w = parseFloat(formData.Weight);
      const h = parseFloat(formData.Height);
      if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        const bmiCase = computeBMICase(parseFloat(bmi));
        setFormData((prev) => ({ ...prev, BMI: bmi, BMIcase: bmiCase }));
      }
    }
  }, [formData.Weight, formData.Height]);

  useEffect(() => {
    if (formData.Age) {
      const age = parseInt(formData.Age);
      let group = age < 30 ? "Young" : age < 50 ? "Adult" : "Senior";
      setFormData((prev) => ({ ...prev, AgeGroup: group }));
    }
  }, [formData.Age]);

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async () => {
    if (!formData.Weight || !formData.Height || !formData.Gender || !formData.Age) {
      toast.error("Please fill all required fields!");
      return;
    }

    const token = localStorage.getItem("token");
    const backend = "https://health4-lmzi.onrender.com";
    const flaskUrl = "https://workout-plan-app.onrender.com"; // 🔹 replace with your Flask app URL

    const requestBody = {
      Weight: parseFloat(formData.Weight),
      Height: parseFloat(formData.Height),
      BMI: parseFloat(formData.BMI),
      Gender: formData.Gender,
      Age: parseInt(formData.Age),
      BMIcase: formData.BMIcase,
      AgeGroup: formData.AgeGroup,
    };

    try {
      setLoading(true);
      toast.loading("Warming up AI model...");

      // ✅ Step 1: Warm up the Flask app (ignore if it fails)
      try {
        await fetch(flaskUrl);
      } catch {
        console.warn("Flask service might still be waking up...");
      }

      toast.message("Generating your personalized workout plan...");

      // ✅ Step 2: Call your Spring Boot backend
      const res = await fetch(`${backend}/api/workout/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(requestBody),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Backend error:", text);
        throw new Error("Failed to generate workout plan");
      }

      const data = JSON.parse(text);
      const output = data.workout?.planJson || data.plan || data;
      setPlan(output);

      toast.dismiss();
      toast.success("🔥 Your AI-powered workout plan is ready!");
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Server is waking up. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10 space-y-10"
      >
        {/* Header */}
        <div className="text-center mb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-block gradient-primary p-4 rounded-2xl shadow-glow mb-4"
          >
            <Activity className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              FitFusion
            </span>{" "}
            Workout Plan
          </h1>
          <p className="text-muted-foreground text-base">
            Enter your details to generate your AI-powered weekly plan
          </p>
        </div>

        {/* Form Card */}
        <Card className="glass shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Body Metrics</CardTitle>
            <CardDescription className="text-center">
              Your personalized workout begins with understanding your body
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {["Weight", "Height", "Age"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  <Input
                    name={field}
                    type="number"
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    placeholder={
                      field === "Height" ? "in meters" : field === "Weight" ? "in kg" : "in years"
                    }
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.Gender}
                  onValueChange={(v) => setFormData({ ...formData, Gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>BMI</Label>
                <Input readOnly value={formData.BMI} />
              </div>
              <div>
                <Label>BMI Case</Label>
                <Input readOnly value={formData.BMIcase} />
              </div>
              <div>
                <Label>Age Group</Label>
                <Input readOnly value={formData.AgeGroup} />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gradient-primary text-white shadow-glow mt-4"
            >
              <Zap className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate My Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* AI Workout Plan Section */}
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass border border-cyan-500/30 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-cyan-400">
                  💪 Your AI-Crafted Weekly Workout Plan
                </CardTitle>
                <CardDescription className="text-center text-gray-400">
                  Designed to match your body metrics, energy, and fitness goals
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {plan.monthly_plan?.map((week: any, wi: number) => (
                  <motion.div
                    key={wi}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: wi * 0.2 }}
                    className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/70 to-gray-950/80 shadow-xl hover:shadow-cyan-500/10 transition-all"
                  >
                    <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                      <h2 className="text-lg md:text-xl font-bold text-cyan-300 tracking-wide">
                        {week.focus}
                      </h2>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Week {wi + 1}
                      </span>
                    </div>

                    <div className="p-6 grid gap-6">
                      {week.plan.map((day: any, di: number) => (
                        <motion.div
                          key={di}
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-xl p-5 border border-gray-800 bg-gradient-to-br ${gradients[wi % gradients.length]} shadow-lg transition-all`}
                        >
                          <h3 className="text-lg font-semibold text-gray-100 mb-2">
                            📅 {day.day} —{" "}
                            <span className="text-sm text-gray-400">
                              {day.intensity} Intensity
                            </span>
                          </h3>

                          <div className="grid sm:grid-cols-2 gap-4">
                            {day.details.map((ex: any, ei: number) => (
                              <motion.div
                                key={ei}
                                whileHover={{ scale: 1.03 }}
                                className="p-4 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800/60 transition-all"
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
                      ))}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
