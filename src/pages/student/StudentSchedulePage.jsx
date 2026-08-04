import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { studentAPI } from "@/api/services";

// Format a "HH:MM" (24h) time string into Arabic 12h format, e.g. "4:00م"
function formatTime(time) {
  if (!time) return "";
  try {
    const [h, m] = time.split(":");
    const hour = Number(h);
    const suffix = hour >= 12 ? "م" : "ص";
    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${h12}:${m}${suffix}`;
  } catch {
    return time;
  }
}

export default function StudentSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    studentAPI
      .me()
      .then((data) => {
        if (!mounted) return;
        const group = data?.student?.group;
        const sessions = (group?.schedule || []).map((s) => ({
          day: s.day,
          time: formatTime(s.time),
          group: group?.name || "",
        }));
        setSchedule(sessions);
      })
      .catch(() => {
        if (mounted) setSchedule([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>جدولي | منصة الطالب</title>
      </Helmet>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-0.5">جدولي الدراسي</h2>
            <p className="text-muted-foreground text-sm">
              مواعيد الحصص الخاصة بك
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-2xl border-dashed">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">لا يوجد جدول محدد بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((s, i) => (
              <Card key={i} className="border shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{s.day}</p>

                    <p
                      className="text-sm font-semibold text-muted-foreground"
                      style={{
                        direction: "ltr",
                        unicodeBidi: "plaintext",
                      }}
                    >
                      {s.time}
                    </p>

                    <p className="text-xs text-primary mt-0.5">{s.group}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}