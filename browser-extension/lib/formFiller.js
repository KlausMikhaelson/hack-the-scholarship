// Form detection and prefilling service

class FormFiller {
  constructor() {
    this.userData = null;
  }

  async loadUserData() {
    try {
      const apiService = await import('./api.js');
      this.userData = await apiService.default.getUserData();
      return true;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return false;
    }
  }

  // Detect common form field patterns
  findFormFields() {
    const fields = {
      name: [],
      firstName: [],
      lastName: [],
      email: [],
      gpa: [],
      major: [],
      extracurriculars: [],
      achievements: [],
      personalBackground: [],
      essay: []
    };

    // Find input fields by common patterns
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const label = this.getLabelText(input);
      const combined = `${name} ${id} ${placeholder} ${label}`.toLowerCase();

      // Name fields
      if (this.matchesPattern(combined, ['name', 'full name', 'fullname', 'applicant name'])) {
        fields.name.push(input);
      }
      
      // First name
      if (this.matchesPattern(combined, ['first name', 'firstname', 'fname', 'given name'])) {
        fields.firstName.push(input);
      }
      
      // Last name
      if (this.matchesPattern(combined, ['last name', 'lastname', 'lname', 'surname', 'family name'])) {
        fields.lastName.push(input);
      }
      
      // Email
      if (this.matchesPattern(combined, ['email', 'e-mail', 'email address'])) {
        fields.email.push(input);
      }
      
      // GPA
      if (this.matchesPattern(combined, ['gpa', 'grade point average', 'g.p.a'])) {
        fields.gpa.push(input);
      }
      
      // Major
      if (this.matchesPattern(combined, ['major', 'field of study', 'area of study', 'program', 'degree'])) {
        fields.major.push(input);
      }
      
      // Extracurriculars
      if (this.matchesPattern(combined, ['extracurricular', 'activities', 'involvement', 'volunteer'])) {
        fields.extracurriculars.push(input);
      }
      
      // Achievements
      if (this.matchesPattern(combined, ['achievement', 'award', 'honor', 'recognition', 'accomplishment'])) {
        fields.achievements.push(input);
      }
      
      // Personal background / essay
      if (this.matchesPattern(combined, ['essay', 'personal statement', 'background', 'biography', 'bio', 'statement', 'why', 'describe'])) {
        fields.essay.push(input);
        fields.personalBackground.push(input);
      }
    });

    return fields;
  }

  getLabelText(input) {
    // Try to find associated label
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent;
    }
    
    // Try to find parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent;
    
    // Try to find nearby label
    const nearbyLabel = input.previousElementSibling;
    if (nearbyLabel && nearbyLabel.tagName === 'LABEL') {
      return nearbyLabel.textContent;
    }
    
    return '';
  }

  matchesPattern(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  fillField(field, value) {
    if (!field || !value) return false;

    try {
      if (field.tagName === 'SELECT') {
        // For select dropdowns, try to find matching option
        const options = Array.from(field.options);
        const matchingOption = options.find(opt => 
          opt.text.toLowerCase().includes(value.toLowerCase()) ||
          opt.value.toLowerCase().includes(value.toLowerCase())
        );
        if (matchingOption) {
          field.value = matchingOption.value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      } else {
        // For input and textarea
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } catch (error) {
      console.error('Failed to fill field:', error);
      return false;
    }
    return false;
  }

  async fillForm() {
    if (!this.userData) {
      const loaded = await this.loadUserData();
      if (!loaded) {
        throw new Error('Failed to load user data');
      }
    }

    const fields = this.findFormFields();
    let filledCount = 0;

    // Fill name fields
    if (fields.name.length > 0 && this.userData.name) {
      fields.name.forEach(field => {
        if (this.fillField(field, this.userData.name)) filledCount++;
      });
    }

    // Fill first name
    if (fields.firstName.length > 0 && this.userData.firstName) {
      fields.firstName.forEach(field => {
        if (this.fillField(field, this.userData.firstName)) filledCount++;
      });
    }

    // Fill last name
    if (fields.lastName.length > 0 && this.userData.lastName) {
      fields.lastName.forEach(field => {
        if (this.fillField(field, this.userData.lastName)) filledCount++;
      });
    }

    // Fill email
    if (fields.email.length > 0 && this.userData.email) {
      fields.email.forEach(field => {
        if (this.fillField(field, this.userData.email)) filledCount++;
      });
    }

    // Fill GPA
    if (fields.gpa.length > 0 && this.userData.gpa) {
      fields.gpa.forEach(field => {
        if (this.fillField(field, this.userData.gpa)) filledCount++;
      });
    }

    // Fill major
    if (fields.major.length > 0 && this.userData.major) {
      fields.major.forEach(field => {
        if (this.fillField(field, this.userData.major)) filledCount++;
      });
    }

    // Fill extracurriculars
    if (fields.extracurriculars.length > 0 && this.userData.extracurriculars) {
      fields.extracurriculars.forEach(field => {
        if (this.fillField(field, this.userData.extracurriculars)) filledCount++;
      });
    }

    // Fill achievements
    if (fields.achievements.length > 0 && this.userData.achievements) {
      fields.achievements.forEach(field => {
        if (this.fillField(field, this.userData.achievements)) filledCount++;
      });
    }

    // Fill essay/personal background (use personalBackground or writingSample)
    const essayText = this.userData.personalBackground || this.userData.writingSample || '';
    if (fields.essay.length > 0 && essayText) {
      fields.essay.forEach(field => {
        if (this.fillField(field, essayText)) filledCount++;
      });
    }

    return {
      success: true,
      filledCount,
      totalFields: Object.values(fields).flat().length
    };
  }
}

// Export singleton instance
const formFiller = new FormFiller();
export default formFiller;

