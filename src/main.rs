
fn main() {
    println!("Hello, world!");
	for p in 0..=100{
		pom(&p);
	}
}

fn pom(i:&i32){
	println!("{}", *i);
}
