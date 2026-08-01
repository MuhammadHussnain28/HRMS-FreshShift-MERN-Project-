import PDFDocument from 'pdfkit';

export const generatePayslipPdf = (payroll, employee) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(25).font('Helvetica-Bold').text('FreshShifts', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Monthly Payslip', { align: 'center' });
      doc.moveDown(2);

      // Employee Details
      doc.fontSize(14).font('Helvetica-Bold').text('Employee Details');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: ${employee.name}`);
      doc.text(`Email: ${employee.email}`);
      doc.text(`Department: ${employee.department || 'N/A'}`);
      doc.text(`Designation: ${employee.designation || 'N/A'}`);
      doc.text(`Joining Date: ${new Date(employee.joiningDate).toLocaleDateString()}`);
      doc.moveDown(2);

      // Salary Period
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      doc.fontSize(14).font('Helvetica-Bold').text(`Salary Period: ${monthNames[payroll.month - 1]} ${payroll.year}`);
      doc.moveDown(1);

      // Earnings & Deductions
      doc.fontSize(14).font('Helvetica-Bold').text('Salary Details');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      
      // We format numbers to 2 decimal places
      const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

      doc.text(`Base Salary: ${formatCurrency(payroll.baseSalary)}`);
      doc.text(`Absent Days: ${payroll.unpaidLeaveDays}`);
      doc.text(`Total Deductions: ${formatCurrency(payroll.deduction)}`, { fillColor: 'red' });
      doc.moveDown(1);
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor('green');
      doc.text(`Net Salary: ${formatCurrency(payroll.netSalary)}`);
      
      // Footer
      doc.moveDown(4);
      doc.fontSize(10).font('Helvetica').fillColor('black').text('This is a computer-generated document. No signature is required.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
