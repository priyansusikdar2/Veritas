import sys
sys.path.insert(0, ".")

from backend.engine.search_coordinator import SearchCoordinatorAgent
from backend.engine.reader_agent import ReaderAgent
from backend.engine.cross_examiner import CrossExaminerAgent
from backend.engine.dossier_agent import DossierAgent

def run_tests():
    coordinator = SearchCoordinatorAgent()
    reader = ReaderAgent()
    cross_examiner = CrossExaminerAgent()
    dossier_agent = DossierAgent()

    test_queries = [
        ("Earth is flat", "Debunked Falsehood", lambda s, v: s < 20 and v == "DEBUNKED / FALSE"),
        ("Vaccines cause autism", "Debunked Falsehood", lambda s, v: s < 20 and v == "DEBUNKED / FALSE"),
        ("Did humans walk on the moon", "Historical Fact (Negation/Debunk Check)", lambda s, v: s >= 80 and v == "CONFIRMED FACTUAL"),
        ("Attention Is All You Need Transformer", "Confirmed Scientific Breakthrough", lambda s, v: s >= 80 and v == "CONFIRMED FACTUAL"),
        ("Google Sycamore quantum supremacy debate", "Contested / Conflicting Evidence", lambda s, v: 40 <= s <= 65),
    ]

    print("=" * 75)
    print("VERITAS TRUTH SCORE CALIBRATION & CONTINUUM EMPIRICAL SUITE")
    print("=" * 75)

    all_passed = True

    for query, label, validator in test_queries:
        print(f"\n[Evaluating] Subject: '{query}'")
        print(f" -> Scenario Tier: {label}")
        subqueries = coordinator.formulate_subqueries(query, depth="deep")
        sources = reader.search_subquery(subqueries[0], max_results=4)
        if len(subqueries) > 1:
            adv_sqs = [sq for sq in subqueries if sq["angle"] == "adversarial"]
            if adv_sqs:
                adv_sources = reader.search_subquery(adv_sqs[0], max_results=3)
                sources.extend(adv_sources)

        print(f" -> Harvested {len(sources)} live web sources.")

        claims, contradictions, truth_score = cross_examiner.extract_and_cross_examine(query, sources)
        dossier = dossier_agent.compile_dossier(query, "deep", sources, claims, contradictions, truth_score)

        verdict = dossier["verdict"]
        passed = validator(truth_score, verdict)
        status_sym = "[PASS]" if passed else "[FAIL]"

        print(f" -> Truth Score: {truth_score}/100 | Verdict: '{verdict}' | Status: {status_sym}")
        print(f" -> Central Claim: {claims[0]['claim_text']}")
        print(f" -> Category: {claims[0]['category']} | Confidence: {claims[0]['confidence']}%")
        print(f" -> Substantive Sub-Claims count: {len(claims) - 1}")
        if len(claims) > 1:
            print(f"    Sample Sub-Claim: '{claims[1]['claim_text'][:70]}...' [{claims[1]['category']}]")
        r1_m = dossier['debate_arena']['rounds'][0]['momentum_score']
        r2_m = dossier['debate_arena']['rounds'][1]['momentum_score']
        r3_m = dossier['debate_arena']['rounds'][2]['momentum_score']
        print(f" -> Dynamic Debate Momentum: R1={r1_m}, R2={r2_m}, R3={r3_m}")
        if not passed:
            all_passed = False

    print("\n" + "=" * 75)
    if all_passed:
        print("ALL VERITAS TRUTH SCORE CALIBRATION TESTS PASSED WITH 100% ACCURACY!")
    else:
        print("SOME TESTS FAILED - REVIEW OUTPUT ABOVE")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
