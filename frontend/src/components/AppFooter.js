import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://dilips.pythonanywhere.com/" target="_blank" rel="noopener noreferrer">
          Dilip sapkota
        </a>
        <span className="ms-1">&copy; 2024 Dilip.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://dilips.pythonanywhere.com/" target="_blank" rel="noopener noreferrer">
          Dilip Sapkota
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
