import { Component, OnInit, OnDestroy } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { base64 } from './base64';

import html2canvas from 'html2canvas';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

@Component({
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  
    lblEmpresa: string = 'Empresa WS Fictor Remodeling & Paiting';
    lblTelefono: string = '+1 (704) 235-7771';
    lblCorreo: string = 'wilsonsolorzano864@gmail.com';
    lblDireccion: string = 'CHARLOTTE, NORTH CAROLINE, EE. UU.';
    lblTrabajador: string = 'WILSON SOLORZANO RODRIGUEZ';

    randomNumber: number = 0;
 
    value5: any;
    checkboxValue: any[] = [];

    descripcionProyecto: string = '';
    
    tipoProyecto: any;
    tipoConstruccion: any;
    presupuestoEstimado: number | null = null;
    fechaCotizacion: string = new Date().toLocaleDateString();
    
    base64: base64 = new base64();
    logoBase64: string = this.base64.imagenBase64;
    
    cols: any[] = [];

    ngOnInit() {
      this.generateRandom8Digits();
    }

    generateRandom8Digits(): void {
      this.randomNumber =  Math.floor(10000000 + Math.random() * 90000000);
    }

    isGeneratingPDF = false;
   
  

    generatePDF1() {
      this.isGeneratingPDF = true; // Oculta los botones
      const invoiceElement = document.querySelector('.invoice-container') as HTMLElement;
      html2canvas(invoiceElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgHeight = (canvas.height * 210) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, 210, imgHeight);
        pdf.save('invoice.pdf');
      });
      this.isGeneratingPDF = false;
    }

    invoiceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.invoiceForm = this.fb.group({
      items: this.fb.array([]),
      nombreCliente: [''],
      direccionCliente: [''],
      telefonoCliente: [''],
      correoCliente: ['']
    });
    this.addItem(); // Inicializa con un ítem vacío.
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      product: [''],
      quantity: [null],
      price: [null],
      amount: [0]
    });
    this.items.push(itemGroup);
  }

  

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  calculateAmount(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    const amount = quantity * price;
    item.get('amount')?.setValue(amount, { emitEvent: false });
    return amount;
  }

  getAmount(index: number): number {
    return this.items.at(index).get('amount')?.value || 0;
  }

  getSubtotal(): number {
    return this.items.controls
      .map((item) => item.get('amount')?.value || 0)
      .reduce((acc, value) => acc + value, 0);
  }

  /*getTax(): number {
    return this.getSubtotal() * 0.08;
  }*/

    isTaxEnabled: boolean = true;
  getTax(): number {
    return this.isTaxEnabled ? this.getSubtotal() * 0.08 : 0;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }
 
  updateTax(): void {
    this.isTaxEnabled = (this.isTaxEnabled) ? false : true;
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

generatePDF() { 
  const doc = new jsPDF();

  // Espaciado entre secciones
  const spacing = 10;

  // Añadir logo en la parte izquierda
  const logoUrl = 'assets/logo.webp'; // Ruta a tu logo
  doc.addImage(logoUrl, 'WEBP', 20, 20, 40, 30); 

  doc.setFontSize(25);
  doc.text('INVOICE:', 120, 30);

  // Número de factura y fecha alineados a la derecha
  doc.setFontSize(12);
  doc.text(`NO. INVOICE: ${this.randomNumber}`, 120, 40);
  doc.text(`INVOICE DATE: ${this.formatDate(this.value5)}`, 120, 50);

  // Datos de la empresa
  doc.text('FROM:', 20, 65);
  doc.text(`${this.lblTrabajador}`, 20, 72);
  doc.text(`${this.lblDireccion}`, 20, 82);
  doc.text(`${this.lblTelefono}`, 20, 92);
  doc.text(`${this.lblCorreo}`, 20, 100);

  // Sección de facturación (BILL TO)
  doc.text('BILL TO:', 120, 65);
  doc.text(this.invoiceForm.value.nombreCliente, 120, 72);
  doc.text(this.invoiceForm.value.direccionCliente, 120, 82);
  doc.text(this.invoiceForm.value.telefonoCliente, 120, 92);
  doc.text(this.invoiceForm.value.correoCliente, 120, 100);

  // Configuración de la tabla de productos
  const startY = 120;
  doc.setFillColor(200, 200, 255);
  doc.rect(20, startY - 10, 170, 10, 'F');
  doc.setTextColor(0, 0, 102);
  doc.setFontSize(12);
  doc.text('PRODUCT/SERVICE', 22, startY - 2);
  doc.text('QTY', 115, startY - 2, { align: 'center' });
  doc.text('PRICE ($)', 145, startY - 2, { align: 'center' });
  doc.text('AMOUNT ($)', 175, startY - 2, { align: 'center' });

  // Dibujar bordes de la tabla
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(20, startY - 10, 170, 10);
  doc.line(100, startY - 10, 100, startY);
  doc.line(130, startY - 10, 130, startY);
  doc.line(160, startY - 10, 160, startY);

  // Renderizar productos
  doc.setTextColor(0, 0, 0);
  let currentY = startY + 10;
  const items = (this.invoiceForm.get('items') as FormArray).controls;

  items.forEach((item, index) => {
    const product = item.get('product')?.value || '';
    const quantity = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    const amount = this.calculateAmount(index);
    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    const formattedAmount = new Intl.NumberFormat('en-US').format(amount);

    // Dividir líneas largas de texto para el campo `product`
    const splitText = doc.splitTextToSize(product, 75); // Ajusta el ancho según sea necesario

    splitText.forEach((line, i) => {
      const yPosition = currentY + i * 6;
      if (i === 0) {
        doc.text(line, 22, yPosition);
        doc.text(quantity.toString(), 115, yPosition, { align: 'center' });
        doc.text(formattedPrice, 145, yPosition, { align: 'center' });
        doc.text(formattedAmount, 175, yPosition, { align: 'center' });
      } else {
        doc.text(line, 22, yPosition); // Solo agrega el texto en las líneas adicionales
      }
    });

    // Dibujar bordes de la fila
    const rowHeight = splitText.length * 6;
    doc.rect(20, currentY - 6, 170, rowHeight);
    doc.line(100, currentY - 6, 100, currentY + rowHeight - 6);
    doc.line(130, currentY - 6, 130, currentY + rowHeight - 6);
    doc.line(160, currentY - 6, 160, currentY + rowHeight - 6);

    currentY += rowHeight + 4; // Espaciado dinámico entre filas
  });

  // Totales
  let totalsStartY = currentY - 10;

  // Altura de la página y margen inferior
const pageHeight = doc.internal.pageSize.height;
const bottomMargin = 20; // Espacio mínimo al final de la página

// Verifica si hay suficiente espacio para el bloque de totales
if (totalsStartY + 30 > pageHeight - bottomMargin) {
  doc.addPage(); // Crear una nueva página
  totalsStartY = 20; // Reiniciar la posición Y en la nueva página
}

// Alineación para los totales
const subtotalX = 168; // Alineación para SUBTOTAL
const taxX = 168;      // Alineación para TAX
const totalX = 168;    // Alineación para TOTAL

// Añadir bordes para los totales
doc.rect(130, totalsStartY, 60, 30); // Marco general
doc.rect(130, totalsStartY, 60, 10); // Borde SUBTOTAL
doc.rect(130, totalsStartY + 10, 60, 10); // Borde TAX
doc.rect(130, totalsStartY + 20, 60, 10); // Borde TOTAL

// Añadir textos de los totales
doc.text(` SUBTOTAL:`, 130, totalsStartY + 7);
doc.text(` TAX 8%:`, 130, totalsStartY + 17);
doc.text(` TOTAL:`, 130, totalsStartY + 27);

// Línea vertical divisoria
doc.line(160, totalsStartY, 160, totalsStartY + 30);

// Añadir valores de los totales
doc.text(`$ ${new Intl.NumberFormat('en-US').format(this.getSubtotal())}`, subtotalX, totalsStartY + 7);
doc.text(`$ ${new Intl.NumberFormat('en-US').format(this.getTax())}`, taxX, totalsStartY + 17);
doc.text(`$ ${new Intl.NumberFormat('en-US').format(this.getTotal())}`, totalX, totalsStartY + 27);

  doc.save('invoice.pdf');
}




}
