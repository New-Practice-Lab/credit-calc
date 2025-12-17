import { describe, it, expect, beforeEach } from 'vitest'
import { displayCheck } from '@/js/credit-calc-utils.js'

describe('displayCheck', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '<div id="test-check"></div>'
  })

  it('should display "Eligible ✓" and pass class for true value', () => {
    displayCheck('test-check', true)

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('Eligible ✓')
    expect(element.className).toBe('detail-value pass')
  })

  it('should display "Eligible ✓" and pass class for string "true"', () => {
    displayCheck('test-check', 'true')

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('Eligible ✓')
    expect(element.className).toBe('detail-value pass')
  })

  it('should display "Ineligible ✗" and fail class for false value', () => {
    displayCheck('test-check', false)

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('Ineligible ✗')
    expect(element.className).toBe('detail-value fail')
  })

  it('should display "Ineligible ✗" and fail class for string "false"', () => {
    displayCheck('test-check', 'false')

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('Ineligible ✗')
    expect(element.className).toBe('detail-value fail')
  })

  it('should display "-" and base class for null value', () => {
    displayCheck('test-check', null)

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('-')
    expect(element.className).toBe('detail-value')
  })

  it('should display "-" and base class for undefined value', () => {
    displayCheck('test-check', undefined)

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('-')
    expect(element.className).toBe('detail-value')
  })

  it('should display "-" and base class for "Incomplete" value', () => {
    displayCheck('test-check', 'Incomplete')

    const element = document.getElementById('test-check')
    expect(element.textContent).toBe('-')
    expect(element.className).toBe('detail-value')
  })

  it('should update existing element content', () => {
    const element = document.getElementById('test-check')
    element.textContent = 'Old content'
    element.className = 'old-class'

    displayCheck('test-check', true)

    expect(element.textContent).toBe('Eligible ✓')
    expect(element.className).toBe('detail-value pass')
  })

  it('should handle multiple calls to same element', () => {
    displayCheck('test-check', true)
    let element = document.getElementById('test-check')
    expect(element.textContent).toBe('Eligible ✓')

    displayCheck('test-check', false)
    element = document.getElementById('test-check')
    expect(element.textContent).toBe('Ineligible ✗')

    displayCheck('test-check', null)
    element = document.getElementById('test-check')
    expect(element.textContent).toBe('-')
  })
})
