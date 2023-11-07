import request from '@/utils/request'

export function genExercise(data) {
  return request({
    url: '/stu/practice/genExercise',
    method: 'post',
    data: data
  })
}

export function submitPractice(id) {
  return request({
    url: '/stu/practice/submit/' + id,
    method: 'get'
  })
}