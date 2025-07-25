import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

const CHART_COLORS = [
  'hsl(214, 84%, 56%)',   // Primary blue
  'hsl(142, 76%, 36%)',   // Success green
  'hsl(38, 92%, 50%)',    // Warning orange
  'hsl(0, 84%, 60%)',     // Destructive red
  'hsl(262, 83%, 58%)',   // Purple
  'hsl(173, 58%, 39%)',   // Teal
  'hsl(43, 74%, 49%)',    // Yellow
  'hsl(211, 82%, 68%)',   // Light blue
  'hsl(333, 71%, 51%)',   // Pink
  'hsl(25, 95%, 53%)'     // Orange
];

const ExpenseCharts = ({ expenses }: ExpenseChartsProps) => {
  // Prepare data for pie chart (category distribution)
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ 
        category: expense.category, 
        amount: expense.amount,
        percentage: 0 
      });
    }
    return acc;
  }, [] as { category: string; amount: number; percentage: number }[]);

  const totalAmount = categoryData.reduce((sum, item) => sum + item.amount, 0);
  categoryData.forEach(item => {
    item.percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
  });

  // Prepare data for monthly trend chart
  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const existing = acc.find(item => item.monthKey === monthKey);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({ 
        monthKey,
        month: monthName,
        amount: expense.amount,
        count: 1
      });
    }
    return acc;
  }, [] as { monthKey: string; month: string; amount: number; count: number }[]);

  // Sort by month
  monthlyData.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Prepare data for daily expenses (last 30 days)
  const dailyData = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expenseDate >= thirtyDaysAgo;
    })
    .reduce((acc, expense) => {
      const dateKey = expense.date;
      const existing = acc.find(item => item.date === dateKey);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ 
          date: dateKey, 
          amount: expense.amount,
          displayDate: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      return acc;
    }, [] as { date: string; amount: number; displayDate: string }[]);

  // Sort by date
  dailyData.sort((a, b) => a.date.localeCompare(b.date));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Amount: ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.category}</p>
          <p className="text-sm text-primary">₹{data.amount.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <Card className="bg-gradient-card shadow-card border-0 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => `${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend Bar Chart */}
        <Card className="bg-gradient-card shadow-card border-0 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(214, 84%, 56%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Area Chart */}
      <Card className="bg-gradient-card shadow-card border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Expense Trend (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(214, 84%, 56%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(214, 84%, 56%)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(214, 84%, 56%)"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Categories by Amount */}
      <Card className="bg-gradient-card shadow-card border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((category, index) => (
                <div 
                  key={category.category} 
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">₹{category.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseCharts;