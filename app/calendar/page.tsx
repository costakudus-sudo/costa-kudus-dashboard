"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

import { getJobs } from "../../lib/jobService";

export default function CalendarPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        console.error("Error loading jobs:", error);
      }
    };

    loadJobs();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  const today = new Date();

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const getJobsForDay = (day: number) => {
    return jobs.filter((job) => {
      if (!job.createdAt) return false;

      let jobDate: Date;

      if (job.createdAt?.seconds) {
        jobDate = new Date(
          job.createdAt.seconds * 1000
        );
      } else {
        jobDate = new Date(job.createdAt);
      }

      return (
        jobDate.getDate() === day &&
        jobDate.getMonth() === month &&
        jobDate.getFullYear() === year
      );
    });
  };

  const selectedJobs =
    selectedDay !== null
      ? getJobsForDay(selectedDay)
      : [];

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Calendar
          </h1>

          <p className="mt-1 text-slate-500">
            View your Costa Kudus Tech jobs and activities.
          </p>
        </div>

        <button
          onClick={() => setShowEvents(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          View Events
        </button>

      </div>

      {/* CALENDAR */}

      <div className="rounded-2xl border bg-white shadow-sm">

        {/* CALENDAR HEADER */}

        <div className="flex items-center justify-between border-b p-6">

          <button
            onClick={previousMonth}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronLeft />
          </button>

          <h2 className="text-2xl font-bold text-slate-800">
            {monthName}
          </h2>

          <button
            onClick={nextMonth}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ChevronRight />
          </button>

        </div>

        {/* WEEK DAYS */}

        <div className="grid grid-cols-7 border-b bg-slate-50">

          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-slate-500"
            >
              {day}
            </div>
          ))}

        </div>

        {/* DAYS */}

        <div className="grid grid-cols-7">

          {/* EMPTY DAYS */}

          {Array.from({
            length: firstDay,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="min-h-32 border-b border-r bg-slate-50/50"
            />
          ))}

          {/* MONTH DAYS */}

          {Array.from({
            length: daysInMonth,
          }).map((_, index) => {

            const day = index + 1;
            const dayJobs = getJobsForDay(day);

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setShowEvents(true);
                }}
                className="min-h-32 border-b border-r p-3 text-left transition hover:bg-blue-50"
              >

                {/* DATE */}

                <div
                  className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day)
                      ? "bg-blue-600 text-white"
                      : "text-slate-700"
                  }`}
                >
                  {day}
                </div>

                {/* JOBS */}

                <div className="space-y-1">

                  {dayJobs
                    .slice(0, 3)
                    .map((job) => (
                      <div
                        key={job.id}
                        className="truncate rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {job.clientName ||
                          job.fullName ||
                          "Job"}
                      </div>
                    ))}

                  {dayJobs.length > 3 && (
                    <p className="text-xs text-slate-500">
                      +{dayJobs.length - 3} more
                    </p>
                  )}

                </div>

              </button>
            );
          })}

        </div>

      </div>

      {/* LEGEND */}

      <div className="flex items-center gap-6 rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-blue-600" />

          <span className="text-sm text-slate-600">
            Today
          </span>

        </div>

        <div className="flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-blue-100" />

          <span className="text-sm text-slate-600">
            Jobs
          </span>

        </div>

      </div>

      {/* EVENTS MODAL */}

      {showEvents && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedDay
                    ? `Events for ${selectedDay} ${monthName}`
                    : "Calendar Events"}
                </h2>

                <p className="text-sm text-slate-500">
                  Costa Kudus Tech
                </p>

              </div>

              <button
                onClick={() => {
                  setShowEvents(false);
                  setSelectedDay(null);
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>

            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">

              {selectedJobs.length === 0 ? (

                <div className="py-10 text-center">

                  <CalendarDays
                    size={45}
                    className="mx-auto mb-4 text-slate-300"
                  />

                  <p className="font-medium text-slate-600">
                    No jobs scheduled for this date.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {selectedJobs.map((job) => (

                    <div
                      key={job.id}
                      className="rounded-xl border bg-slate-50 p-4"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="font-bold text-slate-800">
                            {job.clientName ||
                              job.fullName ||
                              "Client"}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {job.service}
                          </p>

                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {job.jobStatus || "Pending"}
                        </span>

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

                        <div>
                          <span className="text-slate-400">
                            Phone
                          </span>

                          <p className="font-medium">
                            {job.phone || "—"}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400">
                            Amount
                          </span>

                          <p className="font-medium">
                            GH₵{" "}
                            {Number(
                              job.amount || 0
                            ).toFixed(2)}
                          </p>
                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            <div className="flex justify-end border-t p-6">

              <button
                onClick={() => {
                  setShowEvents(false);
                  setSelectedDay(null);
                }}
                className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-900"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}