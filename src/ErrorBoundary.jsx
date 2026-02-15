import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[BTM ErrorBoundary]', error, errorInfo)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#1a1a2e', color: '#fc8181', minHeight: '100vh' }}>
          <h2 style={{ color: '#fff', fontSize: 24 }}>⚠️ App Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#888', marginTop: 8 }}>{this.state.error.stack}</pre>
          {this.state.errorInfo && (
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#666', marginTop: 8 }}>{this.state.errorInfo.componentStack}</pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
