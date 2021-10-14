use std::time::Instant;

fn main() {
    let start = Instant::now();
	for p in 0..=1000000{
		pom(&p);
	}
    let end = start.elapsed();
    println!("{}.{:03}秒経過しました。", end.as_secs(), end.subsec_nanos() / 1_000_000); 
}

fn pom(i:&i32){
	println!("{}", *i);
}
