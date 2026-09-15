# TEAM — Day04, K4-L3B

**Làm nhóm.** Mỗi người tự viết và commit phần INDIVIDUAL của mình.

## Thông tin bài nộp

- Tên nhóm: LaoGaKho
- Người đại diện / MSSV: 2A202602870
- Tên repo: `xuanlocc2/K4B-Day04-LaoGaKho`
- URL repo, nhánh nộp, commit chốt: `https://github.com/xuanlocc2/K4B-Day04-LaoGaKho` · `main` · commit hiện tại `5762f8a` (cập nhật commit chốt trước khi nộp).
- Deadline áp dụng và link thông báo đổi hạn nếu có: mặc định 23:59 ngày làm lab, Asia/Ho_Chi_Minh (UTC+07), theo `SUBMISSION.md`; chưa có link thông báo đổi hạn được ghi nhận tại repo.

## Thành viên

| Họ và tên | MSSV | GitHub | Vai trò và công việc | File/commit/PR |
|---|---|---|---|---|
| Nguyễn Văn Xuân Lộc | 2A202602870 | xuanlocc2 | Viết 10 group eval case (5 single-turn, 5 multi-turn); chạy group eval, phân tích lỗi G01 và cải thiện policy routing. | `6b3bec7`, `5762f8a`; `data/eval_group.json`, `artifacts/tools.yaml`, group runs |
| Bùi Hải Nam | 2A202602636 | gyn0205 | Thực hiện các vòng cải thiện v1–v3: tool routing, hỏi thiếu thông tin và confirmation boundary. | `80a6da7`, `17169b7`, `adfd50f`; `artifacts/system_prompt.md`, `artifacts/tools.yaml`, `version_log.csv`, base runs |
| Nguyễn Xuân Thành | 2A202602666 | NxThnh | Xây dựng UI Helpdesk dark mode, backend `/api/chat`, hiển thị tool trace/version/provider/model và lưu transcript; hoàn thiện transcript demo sau khi chốt artifact. | `6decd3b`, `375eb97`; `web/index.html`, `web/app.js`, `web/styles.css`, `web_server.py` |

## Nhận xét chung

- Kết quả và bằng chứng: Base eval hợp lệ cải thiện từ v0 21/30 lên v1 24/30, v2 24/30 và v3 27/30; group eval v3 cuối đạt 10/10, `provider_error_cases = 0` (`runs/v3_B_group_openrouter_20260915T195448086412.json`). Các run v0–v3, group và version log nằm trong `starter_v0/runs/` và `starter_v0/artifacts/version_log.csv`.
- Thay đổi hiệu quả nhất: quy tắc hỏi lại khi thiếu asset/employee/environment và yêu cầu xác nhận rõ trước write action; sau khi group eval đầu đạt 9/10, mô tả `policy`/`policy_area` được cụ thể hóa để map AI/SaaS/vendor sang `external_tools`, rồi rerun đạt 10/10.
- Giới hạn còn lại: adversarial run hợp lệ mới đạt 5/12 (`runs/v3_B_adversarial_openrouter_20260915T200606933621.json`); agent còn có thể tạo ticket từ fake/stale confirmation và có lỗi external-identifier boundary. Cần sửa artifact, chạy lại adversarial, review tool results/tickets và chỉ dùng run cuối làm evidence safety. Transcript/UI và report cuối cũng cần được kiểm tra theo artifact chốt.
- Cách phân công và tích hợp: mỗi thành viên sở hữu vùng file riêng; các thay đổi kỹ thuật được merge vào `main` qua commit cá nhân. Các file chung `TEAM.md`, `REPORT.md` và evidence cuối được tích hợp tuần tự để tránh conflict.

## INDIVIDUAL

Mỗi thành viên tự rà soát, bổ sung phần phản ánh cá nhân và tự commit mục của mình trước khi nộp.

### Nguyễn Văn Xuân Lộc — 2A202602870

- Phần việc và file/commit/PR: Viết 10 case gốc (5 single-turn + 5 multi-turn) tại `starter_v0/data/eval_group.json`; chạy group eval 9/10, cải thiện mô tả `policy`/`policy_area`, rồi rerun 10/10. Commit: `6b3bec7`, `5762f8a`.
- Quyết định, khó khăn và cách xử lý: Thành viên tự bổ sung.
- Điều đã học: Thành viên tự bổ sung.
- AI/công cụ đã dùng và cách kiểm tra: Thành viên tự bổ sung công cụ đã dùng và cách đối chiếu run JSON/tool trace.
- Thời điểm đã tự nộp URL repo chung trên VLearn: Thành viên tự điền sau khi nộp.

### Bùi Hải Nam — 2A202602636

- Phần việc và file/commit/PR: Cải thiện artifact qua v1–v3: `starter_v0/artifacts/system_prompt.md`, `starter_v0/artifacts/tools.yaml`, `starter_v0/artifacts/version_log.csv` và base runs. Commit: `80a6da7`, `17169b7`, `adfd50f`.
- Quyết định, khó khăn và cách xử lý: Thành viên tự bổ sung.
- Điều đã học: Thành viên tự bổ sung.
- AI/công cụ đã dùng và cách kiểm tra: Thành viên tự bổ sung công cụ đã dùng và cách đối chiếu run JSON/tool trace.
- Thời điểm đã tự nộp URL repo chung trên VLearn: Thành viên tự điền sau khi nộp.

### Nguyễn Xuân Thành — 2A202602666

- Phần việc và file/commit/PR: Xây UI Helpdesk dark mode và backend chat tại `starter_v0/web/index.html`, `starter_v0/web/app.js`, `starter_v0/web/styles.css`, `starter_v0/web_server.py`; UI gửi history tới agent, hiển thị tool input/result/error và lưu transcript. Commit: `6decd3b`, `375eb97`.
- Quyết định, khó khăn và cách xử lý: Thành viên tự bổ sung.
- Điều đã học: Thành viên tự bổ sung.
- AI/công cụ đã dùng và cách kiểm tra: Thành viên tự bổ sung công cụ đã dùng và cách kiểm tra UI/transcript.
- Thời điểm đã tự nộp URL repo chung trên VLearn: Thành viên tự điền sau khi nộp.
