# Test Scenario Template

## Test Information
- **Test Level**: [1-4] [Micro-tweaks | Component-changes | Feature-development | Massive-overhauls]
- **Test Name**: [Descriptive name]
- **Test ID**: [Unique identifier]
- **Date Created**: [YYYY-MM-DD]
- **Last Updated**: [YYYY-MM-DD]

## Test Objective
**What are we trying to achieve?**
[Clear description of the change or feature being implemented]

## Prerequisites
- [ ] WordPress site is running and accessible
- [ ] Docker containers are operational
- [ ] Browser MCP is connected and functional
- [ ] Test environment is backed up
- [ ] Baseline screenshots are captured

## Test Steps

### Preparation
1. **Environment Setup**
   - [ ] Start Docker containers: `docker-compose up -d`
   - [ ] Verify WordPress accessibility at http://localhost:8090
   - [ ] Connect Browser MCP
   - [ ] Take baseline screenshots

2. **Backup Procedures**
   - [ ] Database snapshot: `docker-compose exec mysql mysqldump -u wordpress -p wordpress > backup.sql`
   - [ ] File system backup: `tar -czf wp-content-backup.tar.gz wp-content/`
   - [ ] Git commit current state

### Implementation
3. **Claude Code Actions**
   ```
   [Specific Claude Code commands and file operations]
   ```

4. **Browser MCP Actions**
   ```
   [Specific Browser MCP commands for testing and validation]
   ```

### Validation
5. **Visual Validation**
   - [ ] Take after screenshots
   - [ ] Compare before/after visually
   - [ ] Test on mobile/tablet/desktop
   - [ ] Cross-browser testing (Chrome, Firefox, Safari)

6. **Functional Testing**
   - [ ] Test all interactive elements
   - [ ] Verify forms and navigation
   - [ ] Check performance metrics
   - [ ] Validate accessibility

## Success Criteria
- [ ] **Primary Objective Met**: [Specific requirement]
- [ ] **Visual Quality**: Screenshots show expected changes
- [ ] **Functionality**: All features work as expected
- [ ] **Performance**: No degradation in load times
- [ ] **Compatibility**: Works across browsers and devices
- [ ] **No Regressions**: Existing functionality unaffected

## Expected Outcomes
**Before State:**
[Description of initial state]

**After State:**
[Description of expected final state]

## Time Estimates
- **Preparation**: [X minutes]
- **Implementation**: [X minutes]
- **Validation**: [X minutes]
- **Total**: [X minutes]

## Risk Assessment
**Potential Issues:**
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]

**Rollback Plan:**
1. [Step 1 to revert changes]
2. [Step 2 to restore functionality]

## Results
**Test Date**: [YYYY-MM-DD HH:MM]
**Test Status**: [Pass | Fail | Partial]
**Duration**: [Actual time taken]

### Screenshots
- [ ] Before screenshot attached
- [ ] After screenshot attached
- [ ] Mobile screenshot attached
- [ ] Error states documented (if any)

### Performance Metrics
- **Page Load Time Before**: [X seconds]
- **Page Load Time After**: [X seconds]
- **Core Web Vitals**: [LCP/FID/CLS scores]

### Notes
[Any observations, issues encountered, or lessons learned]

## Follow-up Actions
- [ ] Document any new patterns discovered
- [ ] Update automation workflows based on learnings
- [ ] Create reusable components for similar tests
- [ ] Update best practices documentation

## Related Tests
- [Links to similar or dependent test scenarios]

---

**Template Version**: 1.0
**Created for**: Automation Testing Suite