/**
 * ==========================================================
 * Project Name   : Clinic Management System
 * File Name      : seed.ts
 * Component/Class: seed
 * Description    : Implementation file for seed.ts
 *
 * Author         : Pramod Singh
 * Created On     : 2026-01-09
 * Last Modified  : 2026-01-09
 * Version        : 1.0.0
 *
 * Notes          : This file is part of the Clinic Management System project. 
 *                  All rights reserved by Pramod Singh.
 * ==========================================================
 */

import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@clinicease.ai' },
    update: {},
    create: {
      email: 'admin@clinicease.ai',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      phone: '+1-555-0001',
      twoFAEnabled: false,
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create sample provider
  const providerPassword = await bcrypt.hash('provider123!', 12)
  
  const providerUser = await prisma.user.upsert({
    where: { email: 'dr.smith@clinicease.ai' },
    update: {},
    create: {
      email: 'dr.smith@clinicease.ai',
      password: providerPassword,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: Role.PROVIDER,
      phone: '+1-555-0002',
      twoFAEnabled: false,
    },
  })

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      licenseNumber: 'MD123456',
      specialty: 'Internal Medicine',
      department: 'Primary Care',
    },
  })

  console.log('Created provider:', providerUser.email)

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123!', 12)
  
  const patientUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: patientPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.PATIENT,
      phone: '+1-555-0003',
      twoFAEnabled: false,
    },
  })

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1990-01-15'),
      emergencyContact: 'Jane Doe - +1-555-0004',
      insuranceProvider: 'Blue Cross Blue Shield',
    },
  })

  console.log('Created patient:', patientUser.email)

  // Create additional test patients
  const additionalPatients = [
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0005',
      dateOfBirth: new Date('1985-08-22'),
      emergencyContact: 'Robert Smith - +1-555-0006',
      insuranceProvider: 'Aetna',
    },
    {
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0007',
      dateOfBirth: new Date('1978-12-10'),
      emergencyContact: 'Sarah Johnson - +1-555-0008',
      insuranceProvider: 'United Healthcare',
    },
    {
      email: 'lisa.brown@example.com',
      firstName: 'Lisa',
      lastName: 'Brown',
      phone: '+1-555-0009',
      dateOfBirth: new Date('1992-05-18'),
      emergencyContact: 'David Brown - +1-555-0010',
      insuranceProvider: 'Cigna',
    },
  ]

  const createdPatients = [patient]

  // Create additional patients
  for (const patientData of additionalPatients) {
    const patientPassword = await bcrypt.hash('patient123!', 12)
    
    const patientUser = await prisma.user.upsert({
      where: { email: patientData.email },
      update: {},
      create: {
        email: patientData.email,
        password: patientPassword,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        role: Role.PATIENT,
        phone: patientData.phone,
        twoFAEnabled: false,
      },
    })

    const newPatient = await prisma.patient.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: {
        userId: patientUser.id,
        dateOfBirth: patientData.dateOfBirth,
        emergencyContact: patientData.emergencyContact,
        insuranceProvider: patientData.insuranceProvider,
      },
    })

    createdPatients.push(newPatient)
    console.log('Created additional patient:', patientUser.email)
  }

  // Create additional provider (Nurse)
  const nursePassword = await bcrypt.hash('nurse123!', 12)
  
  const nurseUser = await prisma.user.upsert({
    where: { email: 'nurse.emily@clinicease.ai' },
    update: {},
    create: {
      email: 'nurse.emily@clinicease.ai',
      password: nursePassword,
      firstName: 'Emily',
      lastName: 'Davis',
      role: Role.PROVIDER,
      phone: '+1-555-0011',
      twoFAEnabled: false,
    },
  })

  const nurse = await prisma.provider.upsert({
    where: { userId: nurseUser.id },
    update: {},
    create: {
      userId: nurseUser.id,
      licenseNumber: 'RN789012',
      specialty: 'Registered Nurse',
      department: 'Primary Care',
    },
  })

  console.log('Created nurse provider:', nurseUser.email)

  // Create sample appointment
  const appointment = await prisma.appointment.create({
    data: {
      title: 'Annual Physical Exam',
      description: 'Routine annual physical examination',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
      patientId: patient.id,
      providerId: provider.id,
      createdById: adminUser.id,
      status: 'CONFIRMED',
      type: 'routine',
      noShowProbability: 0.15,
    },
  })

  console.log('Created sample appointment:', appointment.id)

  // Create multiple appointments with different statuses
  const appointmentData = [
    {
      title: 'Follow-up Consultation',
      description: 'Follow-up for previous visit',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: 'CONFIRMED',
      type: 'follow-up',
    },
    {
      title: 'Vaccination Appointment',
      description: 'Annual flu vaccination',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      status: 'SCHEDULED',
      type: 'vaccination',
    },
    {
      title: 'Emergency Visit',
      description: 'Urgent care visit',
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      status: 'COMPLETED',
      type: 'emergency',
    },
  ]

  // Create additional appointments
  for (let i = 0; i < appointmentData.length; i++) {
    const appointmentInfo = appointmentData[i]
    const targetPatient = createdPatients[i % createdPatients.length]
    const targetProvider = Math.random() > 0.5 ? provider : nurse

    await prisma.appointment.create({
      data: {
        title: appointmentInfo.title,
        description: appointmentInfo.description,
        startTime: appointmentInfo.startTime,
        endTime: appointmentInfo.endTime,
        patientId: targetPatient.id,
        providerId: targetProvider.id,
        createdById: adminUser.id,
        status: appointmentInfo.status as any,
        type: appointmentInfo.type,
        noShowProbability: Math.random() * 0.3,
      },
    })

    console.log(`Created appointment: ${appointmentInfo.title}`)
  }

  // Create sample messages
  const messageData = [
    {
      senderId: provider.userId,
      receiverId: patient.userId,
      patientId: patient.id,
      content: 'Hello! Your test results are ready. Please schedule a follow-up appointment.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      senderId: patient.userId,
      receiverId: provider.userId,
      patientId: patient.id,
      content: 'Thank you, Dr. Smith. When would be a good time for the follow-up?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      senderId: nurse.userId,
      receiverId: patient.userId,
      patientId: patient.id,
      content: 'Reminder: Please bring your insurance card to your next appointment.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]

  // Create messages
  for (const msgData of messageData) {
    await prisma.message.create({
      data: {
        senderId: msgData.senderId,
        receiverId: msgData.receiverId,
        patientId: msgData.patientId,
        content: msgData.content,
        createdAt: msgData.timestamp,
        isRead: Math.random() > 0.5,
      },
    })
  }

  console.log('Created sample messages')

  // Create sample medical record
  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      providerId: provider.id,
      appointmentId: appointment.id,
      chiefComplaint: 'Annual wellness check',
      diagnosis: 'Patient in good health, no acute concerns',
      treatment: 'Continue current lifestyle, follow up in 1 year',
      notes: 'Patient reports feeling well, no complaints. Vital signs within normal limits.',
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      weight: 170.5,
      height: 70.0,
      readmissionRisk: 0.12,
      suggestedCodes: 'Z00.00 - Encounter for general adult medical examination without abnormal findings',
    },
  })

  console.log('Created medical record:', medicalRecord.id)

  // Create sample billing records with unique invoice numbers
  const timestamp = Date.now()
  const billingData = [
    {
      patientIndex: 0,
      invoiceNumber: `INV-${timestamp}-001`,
      serviceDescription: 'Annual Physical Examination',
      subtotal: 250.00,
      status: 'PENDING',
      insuranceBilled: 200.00,
      patientResponsibility: 50.00,
      paidAmount: 0.00,
    },
    {
      patientIndex: 1,
      invoiceNumber: `INV-${timestamp}-002`,
      serviceDescription: 'Emergency Visit - Urgent Care',
      subtotal: 450.00,
      status: 'PAID',
      insuranceBilled: 360.00,
      patientResponsibility: 90.00,
      paidAmount: 450.00,
    },
    {
      patientIndex: 2,
      invoiceNumber: `INV-${timestamp}-003`,
      serviceDescription: 'Follow-up Consultation',
      subtotal: 180.00,
      status: 'PENDING',
      insuranceBilled: 144.00,
      patientResponsibility: 36.00,
      paidAmount: 0.00,
    },
  ]

  // Create billing records
  for (const billing of billingData) {
    const targetPatient = createdPatients[billing.patientIndex]
    
    await prisma.billing.create({
      data: {
        patientId: targetPatient.id,
        // appointmentId: null, // Make it optional
        invoiceNumber: billing.invoiceNumber,
        serviceDate: new Date(),
        serviceDescription: billing.serviceDescription,
        icdCodes: JSON.stringify(['Z00.00']),
        cptCodes: JSON.stringify(['99396']),
        subtotal: billing.subtotal,
        tax: 0.00,
        total: billing.subtotal,
        status: billing.status as any,
        insuranceBilled: billing.insuranceBilled,
        patientResponsibility: billing.patientResponsibility,
        paidAmount: billing.paidAmount,
      },
    })
  }

  console.log('Created billing records')

  console.log('\\nDatabase seeded successfully!')
  console.log('\\n=== LOGIN CREDENTIALS ===')
  console.log('Admin: admin@clinicease.ai (password: admin123!)')
  console.log('Provider: dr.smith@clinicease.ai (password: provider123!)')
  console.log('Nurse: nurse.emily@clinicease.ai (password: nurse123!)')
  console.log('Patients:')
  console.log('  - john.doe@example.com (password: patient123!)')
  console.log('  - jane.smith@example.com (password: patient123!)')
  console.log('  - mike.johnson@example.com (password: patient123!)')
  console.log('  - lisa.brown@example.com (password: patient123!)')
  console.log('\\nTest data includes:')
  console.log('- 4 patients with different insurance providers')
  console.log('- 2 providers (doctor and nurse)')
  console.log('- Multiple appointments with various statuses')
  console.log('- Sample messages between providers and patients')
  console.log('- Billing records with different payment statuses')
  console.log('- Medical records for patient visits')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })