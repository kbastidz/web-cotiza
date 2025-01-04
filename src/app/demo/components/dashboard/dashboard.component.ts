import { Component, OnInit, OnDestroy } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { base64 } from './base64';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  
    lblEmpresa: string = 'Empresa WS Fictor Remodeling & Paiting';
    lblTelefono: string = 'Teléfono: +1 (704) 235-7771 | Email: wilsonsolorzano864@gmail.com';
    lblDireccion: string = 'Dirección: Estados Unidos, Carolina Norte Charlotte';

    nombreCliente: string = '';
    descripcionProyecto: string = '';
    direccionCliente: string = '';
    tipoProyecto: any;
    tipoConstruccion: any;
    presupuestoEstimado: number | null = null;
    fechaCotizacion: string = new Date().toLocaleDateString();
    
    base64: base64 = new base64();
    logoBase64: string = this.base64.imagenBase64;
    
    cols: any[] = [];

    ngOnInit() {
      this.cols = [
        { field: 'Material', header: 'Material' },
        { field: 'PrecioUnitario', header: 'PrecioUnitario' },
        { field: 'Cantidad', header: 'Cantidad' },
        { field: 'Total', header: 'Total' }
      ];
    }

    materiales: any[] = [
      
    ];
    
    listTipoProyecto: any[] = [
      {name: 'Residencial', code: 'Residencial'},
      {name: 'Comercial', value: 'Comercial'},
      {name: 'Industrial', code: 'Industrial'}
    ];

    listTipoConstruccion: any[] = [
      {name: 'Nuevo', code: 'Nuevo'},
      {name: 'Remodelación', value: 'Remodelación'}
    ];

    totalCotizacion: number = 0;
  
    agregarMaterial() {
      this.materiales.push({ nombre: '', precio: 0, cantidad: 0, total: 0 });
    }
  
    eliminarMaterial(index: number) {
      this.materiales.splice(index, 1);
      this.calcularCotizacion();
    }
  
    calcularCotizacion() {
      this.totalCotizacion = this.materiales.reduce((total, material) => {
        material.total = material.precio * material.cantidad;
        return total + material.total;
      }, 0);
    }

    
    generarPDF() {
        const doc = new jsPDF();
    
        // Agregar logo en la cabecera
        const logoX = 20;
        const logoY = 10;
        const logoWidth = 45;
        const logoHeight = 45;
        doc.addImage(this.logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight); // Logo en la cabecera
    
        // Información de la empresa en la cabecera
        doc.setFontSize(12);
        doc.text(this.lblEmpresa, 80, logoY + 10); // Nombre de la empresa
        doc.setFontSize(10);
        doc.text(this.lblDireccion, 80, logoY + 20); // Dirección
        doc.text(this.lblTelefono, 80, logoY + 30); // Teléfono
        doc.text(`Fecha de Cotización: ${this.fechaCotizacion}`, 80, logoY + 40); // Teléfono
    
        // Título debajo del logo
        doc.setFontSize(22);
        doc.text('Cotización de Proyecto', 20, logoY + logoHeight + 10);
    
        // Información del cliente
        let currentY = logoY + logoHeight + 20; // Ajustar el valor según el espaciado que desees
        doc.setFontSize(12);
       
    
        // "Cliente" a la derecha y "Dirección" a la izquierda en la misma línea
        const pageWidth = doc.internal.pageSize.width;
        const clienteX = 20;  // Posición para "Cliente"
        const direccionX = pageWidth - 20 - doc.getTextWidth(`Dirección: ${this.direccionCliente}`); // Posición calculada para "Dirección"
    
        const tipoX = pageWidth - 20 - doc.getTextWidth(`Tipo de Construcción: ${this.tipoConstruccion?.value}`); 
        
        // Agregar "Cliente" y "Dirección" en la misma línea
        doc.text(`Cliente: ${this.nombreCliente}`, clienteX, currentY);
        doc.text(`Dirección: ${this.direccionCliente}`, direccionX, currentY);
        currentY += 10;     
    
       
        //currentY += 10;
        doc.text(`Tipo de Construcción: ${this.tipoConstruccion?.value}`, tipoX, currentY);
        doc.text(`Tipo de Proyecto: ${this.tipoProyecto?.value}`, 20, currentY-1);
        currentY += 10;
        doc.text(`Descripción: ${this.descripcionProyecto}`, 20, currentY);
        currentY += 10;
        
        currentY += 3;
    
        // Tabla de materiales
        (doc as any).autoTable({
          startY: currentY,
          head: [['Material', 'Precio Unitario', 'Cantidad', 'Total']],
          body: this.materiales.map(material => [
            material.nombre,
            `$${material.precio}`,
            material.cantidad,
            `$${material.total}`
          ])
        });
    
        // Total de la cotización
        const finalY = (doc as any).autoTable.previous.finalY;
        //doc.text(`Total: $${this.totalCotizacion}`, 20, finalY + 10);
        
        const totalText = `Total: $${this.totalCotizacion}`;
        const totalX = pageWidth - 20 - doc.getTextWidth(totalText); // Ajustar posición a la derecha
        doc.text(totalText, totalX, finalY + 10);

        // Pie de página
        const pageHeight = doc.internal.pageSize.height;
        const footerY = pageHeight - 10; // Posición del pie de página
        doc.setFontSize(10);
        doc.text('Empresa '+this.lblEmpresa+' - Todos los derechos reservados', 20, footerY);
        //doc.text(`Página ${doc.internal.getNumberOfPages()}`, 180, footerY); // Número de página
    
        // Guardar el archivo PDF
        doc.save('cotizacion.pdf');
    }
    
   
}
