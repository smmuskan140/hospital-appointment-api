import prisma from "./lib/prisma.js";
import { createPatient, getPatient, searchPatients, updatePatientPhone, deletePatient } from "./patients.js";
import { createDoctor, listDoctorsBySpecialty, deleteDoctor } from "./doctors.js";
import {
  bookAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
  cancelAllPatientAppointments,
  deleteAppointment
} from "./appointments.js";

async function main(): Promise<void> {
  console.log("\n── Patients ──────────────────────────");
  const patient = await createPatient({
    name: "Test Patient",
    email: `test.patient.${Date.now()}@example.com`,
    phone: "9999999999"
  });
  console.log("Created:", patient.name, patient.id);
  console.log("Found:", (await getPatient(patient.id)).name);
  console.log("Updated phone:", (await updatePatientPhone(patient.id, "8888888888")).phone);
  console.log("Search results:", (await searchPatients("Test Patient")).length);

  console.log("\n── Doctors ───────────────────────────");
  const doctor = await createDoctor({
    name: "Dr. Test",
    specialty: "General Medicine",
    email: `dr.test.${Date.now()}@hospital.io`
  });
  console.log("Created:", doctor.name, doctor.id);
  console.log("General Medicine doctors:", (await listDoctorsBySpecialty("General")).length);

  console.log("\n── Appointments ──────────────────────");
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const appointment = await bookAppointment(patient.id, doctor.id, futureDate, "Initial consultation");
  console.log("Booked:", appointment.id, "for", appointment.patient.name);
  const full = await getAppointmentFull(appointment.id);
  console.log("Full fetch:", full.patient.name, "with", full.doctor.name);
  console.log("Doctor schedule:", (await getDoctorUpcomingAppointments(doctor.id)).length, "appointment(s)");
  console.log("Status updated to:", (await setAppointmentStatus(appointment.id, "cancelled")).status);

  // Exercise bulk cancellation with a second scheduled appointment.
  const secondAppointment = await bookAppointment(patient.id, doctor.id, new Date(Date.now() + 14 * 86400000));
  console.log("Bulk cancelled:", await cancelAllPatientAppointments(patient.id));

  console.log("\n── Cleanup ───────────────────────────");
  await deleteAppointment(secondAppointment.id);
  await deletePatient(patient.id); // also exercises patient CRUD and cascade behavior
  await deleteDoctor(doctor.id);
  console.log("Test data cleaned up.");
}

main()
  .catch((error: unknown) => {
    console.error("Test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
