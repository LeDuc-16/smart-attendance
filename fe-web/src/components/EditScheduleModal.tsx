import React from "react";
import type { TeachingSchedule } from "../api/apiTeaching";

interface EditScheduleModalProps {
  show: boolean;
  data: TeachingSchedule | null;
  onClose: () => void;
  onCancel: () => void;
  formatTime: (str: string) => string;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ show, data, onClose, onCancel, formatTime }) => {
  if (!show || !data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[2px] transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Đơn xin mở lớp dạy bù</h2>
              <p className="text-sm text-gray-500">Báo cáo lý do nghỉ học và đề xuất thời gian lớp học bù gửi đến phòng đào tạo</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-2 font-semibold text-blue-700">Thông tin lớp học bị nghỉ</div>
        <form className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Môn học</label>
              <input className="w-full border rounded px-2 py-1" value={data?.courseName || ""} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày</label>
              <input className="w-full border rounded px-2 py-1" value={data?.weeks?.[0]?.studyDays?.[0]?.date || ""} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Thời gian bắt đầu</label>
              <input className="w-full border rounded px-2 py-1" value={formatTime(data?.startTime) || ""} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Thời gian kết thúc</label>
              <input className="w-full border rounded px-2 py-1" value={formatTime(data?.endTime) || ""} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Lớp học</label>
              <input className="w-full border rounded px-2 py-1" value={data?.className || ""} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phòng học</label>
              <input className="w-full border rounded px-2 py-1" value={data?.roomCode || ""} disabled />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Lý do nghỉ học</label>
            <textarea className="w-full border rounded px-2 py-1" placeholder="Nhập lý do nghỉ" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={onCancel}>Hủy</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Gửi đơn lên Phòng Đào tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;
