import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 text-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md shadow-lg space-y-4">
            <div className="text-4xl">⚽</div>
            <h2 className="text-xl font-black text-slate-900">Đã xảy ra sự cố hiển thị</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {this.state.error?.message || 'Có lỗi khi vẽ giao diện. Vui lòng tải lại hoặc quay về trang chủ.'}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Tải lại trang
              </button>
              <a
                href="/"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
