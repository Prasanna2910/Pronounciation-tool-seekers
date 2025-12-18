function user_test_day(user){
    const tests=user.tests
    const level=user.level
    const level_tests=tests.filter(test=>test.level==level)
    const level_tests_day=level_tests.length
    return level_tests_day
}

export default { user_test_day };