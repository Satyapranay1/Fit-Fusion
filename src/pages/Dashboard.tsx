import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dumbbell, Utensils, Droplet, Target, Heart } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const backend = "https://health4-lmzi.onrender.com";

export default function Dashboard() {
  const [chartData, setChartData] = useState<
    { day: string; workouts: number; water: number }[]
  >([]);
  const [stats, setStats] = useState([
    { icon: Dumbbell, label: "Workouts", value: "0", color: "gradient-primary" },
    { icon: Utensils, label: "Diet Plans", value: "0", color: "gradient-accent" },
    { icon: Droplet, label: "Water Intake", value: "0 L", color: "gradient-info" },
    { icon: Heart, label: "Wishlist Items", value: "0", color: "gradient-pink" },
    { icon: Target, label: "Goals Completed", value: "0/0", color: "gradient-success" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all user-related data
        const [workoutsRes, dietRes, waterRes, wishlistRes, goalsRes] =
          await Promise.all([
            axios.get(`${backend}/api/workout/user`, { headers }),
            axios.get(`${backend}/api/diet/all`, { headers }),
            axios.get(`${backend}/api/water/list`, { headers }),
            axios.get(`${backend}/api/cart/all`, { headers }),
            axios.get(`${backend}/api/goals`, { headers }),
          ]);

        const workoutData = Array.isArray(workoutsRes.data)
          ? workoutsRes.data
          : [];
        const waterData = Array.isArray(waterRes.data) ? waterRes.data : [];

        // 🧠 Last 7 days
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split("T")[0];
        });

        // 🏋️‍♂️ Prepare chart data
        const chart = last7Days.map((dateStr) => {
          const workoutsCount = workoutData.filter((w: any) => {
            const createdDate = new Date(w.createdAt).toISOString().split("T")[0];
            return createdDate === dateStr;
          }).length;

          const waterDay = waterData
            .filter((w: any) => w.date === dateStr)
            .reduce((sum: number, w: any) => sum + (w.amountLiters || 0), 0);

          return {
            day: dateStr.slice(5), // e.g. 11-03
            workouts: workoutsCount,
            water: waterDay,
          };
        });

        setChartData(chart);

        // ✅ Summary Stats
        const totalWorkouts = workoutData.length || 0;
        const totalDiets = dietRes.data?.length || 0;
        const totalWater = waterData
          .reduce((sum: number, w: any) => sum + (w.amountLiters || 0), 0)
          .toFixed(1);
        const wishlistCount = wishlistRes.data?.length || 0;
        const completedGoals =
          goalsRes.data?.filter((g: any) => g.completed).length || 0;
        const totalGoals = goalsRes.data?.length || 0;

        setStats([
          {
            icon: Dumbbell,
            label: "Workouts",
            value: `${totalWorkouts}`,
            color: "gradient-primary",
          },
          {
            icon: Utensils,
            label: "Diet Plans",
            value: `${totalDiets}`,
            color: "gradient-accent",
          },
          {
            icon: Droplet,
            label: "Water Intake",
            value: `${totalWater} L`,
            color: "gradient-info",
          },
          {
            icon: Heart,
            label: "Wishlist Items",
            value: `${wishlistCount}`,
            color: "gradient-pink",
          },
          {
            icon: Target,
            label: "Goals Completed",
            value: `${completedGoals}/${totalGoals}`,
            color: "gradient-success",
          },
        ]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Your Wellness Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Overview of your fitness, nutrition, and habits
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Workouts Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass shadow-lg">
            <CardHeader>
              <CardTitle>Workouts This Week</CardTitle>
              <CardDescription>
                Number of workouts logged each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Water Intake Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass shadow-lg">
            <CardHeader>
              <CardTitle>Water Intake</CardTitle>
              <CardDescription>
                Daily water consumption (liters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="water"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
