"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  HardDrive,
  Image,
  Film,
  RefreshCw,
  AlertTriangle,
  Activity,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminDashboardStats } from "@/types";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [searchAnalytics, setSearchAnalytics] = useState<Array<{ query: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const fetchStats = async (secret: string) => {
    const res = await fetch("/api/admin", {
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data);
      setSearchAnalytics(data.searchAnalytics ?? []);
      setAuthenticated(true);
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (adminSecret) fetchStats(adminSecret);
  };

  const triggerScan = async () => {
    setScanning(true);
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "scan" }),
      });
      await fetchStats(adminSecret);
    } finally {
      setScanning(false);
    }
  };

  const rebuildThumbnails = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ action: "rebuild_thumbnails" }),
    });
    await fetchStats(adminSecret);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24">
          <h1 className="mb-6 text-2xl font-bold">Admin Access</h1>
          <input
            type="password"
            placeholder="Admin Secret"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border bg-background px-4 py-2"
          />
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={triggerScan} disabled={scanning} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Run Scan"}
            </Button>
            <Button variant="outline" onClick={rebuildThumbnails}>
              Rebuild Thumbnails
            </Button>
          </div>
        </div>

        {loading || !stats ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Media"
                value={stats.totalMedia}
                icon={<Database className="h-5 w-5" />}
              />
              <StatCard
                title="Photos"
                value={stats.photoCount}
                icon={<Image className="h-5 w-5" />}
              />
              <StatCard
                title="Videos"
                value={stats.videoCount}
                icon={<Film className="h-5 w-5" />}
              />
              <StatCard
                title="Storage Used"
                value={stats.storageUsed}
                icon={<HardDrive className="h-5 w-5" />}
                isString
              />
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4" />
                    Scanner Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={stats.scannerStatus === "running" ? "default" : "secondary"}
                  >
                    {stats.scannerStatus}
                  </Badge>
                  {stats.lastScan && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Last scan: {new Date(stats.lastScan.startedAt).toLocaleString()}
                      <br />
                      {stats.lastScan.filesScanned} files scanned, {stats.lastScan.filesAdded} added
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Broken files</span>
                    <span className="font-medium">{stats.brokenFiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing files</span>
                    <span className="font-medium">{stats.missingFiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicates</span>
                    <span className="font-medium">{stats.duplicateFiles}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-4 w-4" />
                    Top Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchAnalytics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No search data yet</p>
                  ) : (
                    <div className="space-y-1">
                      {searchAnalytics.slice(0, 5).map((s) => (
                        <div key={s.query} className="flex justify-between text-sm">
                          <span className="truncate">{s.query}</span>
                          <span className="text-muted-foreground">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {stats.recentScans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentScans.map((scan) => (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <Badge variant={scan.status === "COMPLETED" ? "secondary" : "destructive"}>
                            {scan.status}
                          </Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(scan.startedAt).toLocaleString()} · {scan.triggeredBy}
                          </span>
                        </div>
                        <div className="text-sm">
                          +{scan.filesAdded} / ~{scan.filesUpdated} / -{scan.filesDeleted}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  isString,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isString?: boolean;
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold">
              {isString ? value : (value as number).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
