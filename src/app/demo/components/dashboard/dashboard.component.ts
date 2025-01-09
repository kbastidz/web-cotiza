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
      quantity: [0],
      price: [0],
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

  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }
 
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses empiezan desde 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

  generatePDF() {
    

    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.width;

    // Añadir logo en la parte izquierda
    const logoUrl = 'assets/logo.webp'; // Ruta a tu logo
    doc.addImage(logoUrl, 'WEBP', 20, 20, 40, 30);  // 10 (X), 20 (Y), 40 (ancho), 30 (alto)

    // Añadir título de la factura a la derecha
    const rightMargin = 20; // Margen derecho
    const rightX = pageWidth - rightMargin; // Posición X para el texto a la derecha

    doc.setFontSize(18);
    doc.text('INVOICE', rightX, 30, { align: 'right' });

    // Número de factura y fecha alineados a la derecha
    doc.setFontSize(12);
    doc.text(`NO. INVOICE: ${this.randomNumber}`, rightX, 40, { align: 'right' });
    doc.text(`INVOICE DATE: ${this.formatDate(this.value5)}`, rightX, 50, { align: 'right' });

    // Datos de la empresa
    doc.text('FROM:', 20, 60);
    doc.text(`${this.lblTrabajador}`, 20, 70);
    doc.text(`${this.lblDireccion}`, 20, 80);
    doc.text(`${this.lblTelefono}`, 20, 90);
    doc.text(`${this.lblCorreo}`, 20, 100);

    // Sección de facturación (BILL TO)
    doc.text('BILL TO:', 120, 60);
    doc.text(this.invoiceForm.value.nombreCliente, 120, 70); // Valor del campo nombreCliente
    doc.text(this.invoiceForm.value.direccionCliente, 120, 80); // Valor del campo direccionCliente
    doc.text(this.invoiceForm.value.telefonoCliente, 120, 90); // Valor del campo telefonoCliente
    doc.text(this.invoiceForm.value.correoCliente, 120, 100);

    // Recorremos los productos desde el FormArray
    const startY = 120;
    doc.text('PRODUCT/SERVICE', 20, startY);
    doc.text('QTY', 100, startY);
    doc.text('PRICE ($)', 130, startY);
    doc.text('AMOUNT ($)', 160, startY);

    let currentY = startY + 10;

    // Recorremos los items del FormArray
    const items = (this.invoiceForm.get('items') as FormArray).controls;
    items.forEach((item, index) => {
      const product = item.get('product')?.value || '';
      const quantity = item.get('quantity')?.value || 0;
      const price = item.get('price')?.value || 0;
      const amount = this.calculateAmount(index);

      doc.text(product, 20, currentY);
      doc.text(quantity.toString(), 100, currentY);
      doc.text(price.toFixed(2), 130, currentY);
      doc.text(amount+"", 160, currentY);
      currentY += 10;
    });

    // Totales
    doc.text(`SUBTOTAL: ${this.getSubtotal().toFixed(2)}`, 155, currentY + 10);
    doc.text(`TAX 8%: ${this.getTax().toFixed(2)}`, 155, currentY + 20);
    doc.text(`TOTAL: ${this.getTotal().toFixed(2)}`, 155, currentY + 30);

    // Generar y guardar el PDF
    doc.save('invoice.pdf');

  }

}
