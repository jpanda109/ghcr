import {assert} from "chai";

import * as crs from "../lib/crs";

describe("grep", function() {
    it("should return all the positive matches", function() {
        let results = crs.grep("pattern", "hey, pattern, there, pattern, aye, pattern");
        assert.lengthOf(results, 3);
    });
    it("should have correct line numbers", function() {
        let results = crs.grep("bb", "abba\nbbabb\nbb").map(r => r.lineNumber);
        assert.deepEqual(results, [1, 2, 2, 3]);
        results = crs.grep("bb", "abba\nbbabb\nbb\n").map(r => r.lineNumber);
        assert.deepEqual(results, [1, 2, 2, 3]);
    });
    it("should work with multiline/variable patterns", function() {
        let pattern = "\\(\\* CR: [^]* \\*\\)";
        let contents = "dsa(* CR: asd\nfdsa *)asdf";
        let results = crs.grep(pattern, contents);
        assert.lengthOf(results, 1);
        assert.strictEqual(results[0].lineNumber, 1);
        assert.strictEqual(results[0].contents, "(* CR: asd\nfdsa *)")
    });
});