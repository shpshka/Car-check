import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal-screen">
          <div className="fatal-card">
            <span className="brand-mark">AC</span>
            <h1>AutoControl</h1>
            <p>Интерфейс не смог загрузиться. Обновите страницу или очистите localStorage для localhost:5173.</p>
            <code>{this.state.error.message}</code>
            <button className="button primary" type="button" onClick={() => window.location.reload()}>Обновить</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
