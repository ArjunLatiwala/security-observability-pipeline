import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  thresholds: {
    // This is the "Decision Diamond" from your diagram:
    // Fail if more than 1% of requests error out
    // Fail if 95% of requests take longer than 500ms
    http_req_failed: ['rate<0.01'], 
    http_req_duration: ['p(95)<500'], 
  },
};

export default function () {
  const res = http.get('http://localhost:3000');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
