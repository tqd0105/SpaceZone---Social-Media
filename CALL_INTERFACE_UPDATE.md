# Giao diện cuộc gọi cho người gọi

## Vấn đề đã được giải quyết

Trước đây, hệ thống chỉ có giao diện cuộc gọi cho người nhận (`IncomingCallModal`), nhưng không có giao diện cho người gọi. Điều này khiến người gọi không thấy được trạng thái cuộc gọi khi họ bắt đầu gọi.

## Giải pháp đã triển khai

### 1. Tạo OutgoingCallModal Component
- **File**: `src/components/call/OutgoingCallModal.jsx`
- **Mục đích**: Hiển thị giao diện khi người gọi đang chờ người nhận trả lời
- **Tính năng**:
  - Hiển thị avatar và tên người nhận
  - Hiển thị trạng thái "Đang gọi..." với animation dots
  - Hiển thị loại cuộc gọi (video/audio)  
  - Nút kết thúc cuộc gọi
  - Animation kết nối với pulse indicator

### 2. Styling cho OutgoingCallModal
- **File**: `src/components/call/OutgoingCallModal.module.scss`
- **Thiết kế**: 
  - Gradient background tương tự IncomingCallModal
  - Responsive design cho mobile
  - Smooth animations và transitions
  - Dark mode support
  - Pulse animation cho connection status

### 3. Cập nhật CallManager
- **File**: `src/components/call/CallManager.jsx`
- **Thay đổi**:
  - Import `OutgoingCallModal` component
  - Thêm `callState` từ useCall hook
  - Logic hiển thị:
    - `OutgoingCallModal`: Khi `callState === 'calling'` và `activeCall?.isOutgoing`
    - `CallWindow`: Khi `callState === 'connected'` 
    - `IncomingCallModal`: Khi có cuộc gọi đến và chưa kết nối

### 4. Cập nhật useCall Hook
- **File**: `src/hooks/useCall.js`
- **Cải tiến**:
  - Thêm `isOutgoingCall` flag để identify cuộc gọi đi
  - Expose `callState` để CallManager có thể check trạng thái
  - Debug info được mở rộng

## Luồng hoạt động

### Khi bắt đầu cuộc gọi:
1. User click nút gọi trong chat
2. `startCall()` được gọi từ useCall hook
3. `callState` được set thành 'calling'
4. `OutgoingCallModal` hiển thị với thông tin người nhận
5. WebRTC offer được gửi qua socket

### Khi người nhận trả lời:
1. Nhận WebRTC answer qua socket
2. `callState` chuyển thành 'connected'
3. `OutgoingCallModal` ẩn đi
4. `CallWindow` hiển thị với video/audio streams

### Khi kết thúc cuộc gọi:
1. User click nút kết thúc trong `OutgoingCallModal` hoặc `CallWindow`
2. `endCall()` được gọi
3. Tất cả UI components được ẩn
4. `callState` reset về 'idle'

## Test

Để test chức năng:
1. Đăng nhập với 2 users khác nhau
2. Mở chat giữa 2 users  
3. Click nút video call hoặc audio call
4. Xác nhận `OutgoingCallModal` hiển thị cho người gọi
5. User thứ 2 sẽ thấy `IncomingCallModal`
6. Khi accept, cả 2 sẽ thấy `CallWindow`

## Files được tạo/sửa đổi

### Tạo mới:
- `src/components/call/OutgoingCallModal.jsx`
- `src/components/call/OutgoingCallModal.module.scss`

### Sửa đổi:
- `src/components/call/CallManager.jsx` 
- `src/hooks/useCall.js`

Bây giờ người gọi sẽ có giao diện rõ ràng khi bắt đầu cuộc gọi, giống như trải nghiệm trên các ứng dụng cuộc gọi hiện đại khác.