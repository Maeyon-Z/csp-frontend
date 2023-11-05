import request from '@/utils/request'


export function getPaperListForExam() {
  return request({
    url: '/stu/paper/getPaperListForExam',
    method: 'get'
  })
}