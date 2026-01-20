function user_test_day(user){
    const tests=user.tests || [];
    const levelMap = { 1: 'beginner', 2: 'intermediate', 3: 'advanced', 4: 'master' };
    const currentLevelName = levelMap[user.level] || 'beginner';
    
    const level_tests = tests.filter(test => test.level === currentLevelName);
    const level_tests_day = level_tests.length;
    return level_tests_day;
}

export default { user_test_day };