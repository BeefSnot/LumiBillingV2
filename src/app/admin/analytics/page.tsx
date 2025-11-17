'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState<any>({
    revenue: [],
    signups: [],
    cancellations: [],
    topProducts: [],
    revenueByProduct: [],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueChartData = {
    labels: analytics.revenue?.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'Revenue',
        data: analytics.revenue?.map((item: any) => item.value) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const signupsChartData = {
    labels: analytics.signups?.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'New Signups',
        data: analytics.signups?.map((item: any) => item.value) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Cancellations',
        data: analytics.cancellations?.map((item: any) => item.value) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  }

  const productDistributionData = {
    labels: analytics.topProducts?.map((item: any) => item.name) || [],
    datasets: [
      {
        data: analytics.topProducts?.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="mt-2 text-gray-600">Comprehensive business insights and metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading analytics...</div>
      ) : (
        <>
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
            <div className="h-80">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `$${context.parsed.y.toFixed(2)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signups vs Cancellations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Signups vs Cancellations</h3>
              <div className="h-64">
                <Bar
                  data={signupsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            {/* Product Distribution */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
              <div className="h-64">
                <Doughnut
                  data={productDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                ${analytics.totalRevenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                +{analytics.revenueGrowth || 0}% from last period
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-emerald-100 text-sm font-medium">Active Clients</p>
              <p className="text-3xl font-bold mt-2">{analytics.activeClients || 0}</p>
              <p className="text-emerald-100 text-xs mt-2">
                +{analytics.clientGrowth || 0}% from last period
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-amber-100 text-sm font-medium">Active Services</p>
              <p className="text-3xl font-bold mt-2">{analytics.activeServices || 0}</p>
              <p className="text-amber-100 text-xs mt-2">
                {analytics.serviceGrowth || 0}% from last period
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-purple-100 text-sm font-medium">Avg. Revenue/Client</p>
              <p className="text-3xl font-bold mt-2">
                ${analytics.avgRevenuePerClient?.toFixed(2) || '0.00'}
              </p>
              <p className="text-purple-100 text-xs mt-2">
                +{analytics.arpcGrowth || 0}% from last period
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
