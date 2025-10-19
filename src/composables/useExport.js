import { ref } from 'vue'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const useExport = () => {
  const exporting = ref(false)

  // Export counsellors list as PDF
  const exportCounsellorsPDF = async (counsellors, filters = {}) => {
    exporting.value = true
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('MindBridge Counsellors Directory', margin, yPosition)
      yPosition += 15

      // Add export date and filters
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 5
      
      if (filters.searchQuery) {
        pdf.text(`Search: "${filters.searchQuery}"`, margin, yPosition)
        yPosition += 5
      }
      
      if (filters.selectedSpecialty) {
        pdf.text(`Specialty: ${filters.selectedSpecialty}`, margin, yPosition)
        yPosition += 5
      }
      
      pdf.text(`Total Counsellors: ${counsellors.length}`, margin, yPosition)
      yPosition += 15

      // Add counsellors
      for (let i = 0; i < counsellors.length; i++) {
        const counsellor = counsellors[i]
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = margin
        }

        // Counsellor name
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(counsellor.displayName || 'Unknown', margin, yPosition)
        yPosition += 8

        // Email and rating
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Email: ${counsellor.email || 'N/A'}`, margin, yPosition)
        pdf.text(`Rating: ${counsellor.averageRating?.toFixed(1) || '0.0'} (${counsellor.totalRatings || 0} reviews)`, pageWidth - 80, yPosition)
        yPosition += 6

        // Experience and rate
        pdf.text(`Experience: ${counsellor.experience || 0} years`, margin, yPosition)
        pdf.text(`Rate: $${counsellor.hourlyRate || 'N/A'}/hour`, pageWidth - 80, yPosition)
        yPosition += 6

        // Specializations
        if (counsellor.specializations && counsellor.specializations.length > 0) {
          const specializations = counsellor.specializations.join(', ')
          const lines = pdf.splitTextToSize(`Specializations: ${specializations}`, pageWidth - 2 * margin)
          pdf.text(lines, margin, yPosition)
          yPosition += lines.length * 4
        }

        // Session types and languages
        if (counsellor.sessionTypes && counsellor.sessionTypes.length > 0) {
          pdf.text(`Session Types: ${counsellor.sessionTypes.join(', ')}`, margin, yPosition)
          yPosition += 4
        }
        
        if (counsellor.languages && counsellor.languages.length > 0) {
          pdf.text(`Languages: ${counsellor.languages.join(', ')}`, margin, yPosition)
          yPosition += 4
        }

        // License info
        if (counsellor.licenseNumber) {
          pdf.text(`License: ${counsellor.licenseNumber} (${counsellor.licenseState || 'N/A'})`, margin, yPosition)
          yPosition += 4
        }

        // Bio (truncated)
        if (counsellor.bio) {
          const bio = counsellor.bio.length > 200 ? counsellor.bio.substring(0, 200) + '...' : counsellor.bio
          const bioLines = pdf.splitTextToSize(`Bio: ${bio}`, pageWidth - 2 * margin)
          pdf.text(bioLines, margin, yPosition)
          yPosition += bioLines.length * 4
        }

        // Add separator line
        yPosition += 5
        pdf.setDrawColor(200, 200, 200)
        pdf.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10
      }

      // Save the PDF
      const filename = `counsellors-directory-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
      
      return { success: true, message: 'PDF exported successfully' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      exporting.value = false
    }
  }

  // Export any HTML element as PDF
  const exportElementToPDF = async (elementId, filename = 'export.pdf') => {
    exporting.value = true
    
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(filename)
      return { success: true, message: 'PDF exported successfully' }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      exporting.value = false
    }
  }

  // Export data as JSON
  const exportJSON = (data, filename = 'export.json') => {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return { success: true, message: 'JSON exported successfully' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  return {
    exporting,
    exportCounsellorsPDF,
    exportElementToPDF,
    exportJSON
  }
}
