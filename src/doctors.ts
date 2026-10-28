import prisma from "./lib/prisma.js";

export type CreateDoctorInput = {
  name: string;
  specialty: string;
  email: string;
};

export async function createDoctor(data: CreateDoctorInput) {
  return prisma.doctor.create({ data });
}

export async function getDoctor(id: number) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (doctor === null) throw new Error("Doctor not found");
  return doctor;
}

export async function listDoctorsBySpecialty(specialty: string) {
  return prisma.doctor.findMany({
    where: { specialty: { contains: specialty, mode: "insensitive" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, specialty: true, email: true }
  });
}

export async function deleteDoctor(id: number) {
  // PostgreSQL's ON DELETE RESTRICT prevents deleting a doctor with appointments.
  return prisma.doctor.delete({ where: { id } });
}
